import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { ComboResponseDto, ComboProductResponseDto } from './dto/combo-response.dto';

@Injectable()
export class CombosService {
  private readonly logger = new Logger(CombosService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(branchId: string): Promise<ComboResponseDto[]> {
    this.logger.log(`Finding all combos for branch: ${branchId}`);

    const sql = `
      SELECT c.*, 
             COALESCE(
               jsonb_agg(
                 jsonb_build_object(
                   'product_id', p.id,
                   'name', p.name,
                   'quantity', cp.quantity,
                   'image_url', p.image_url
                 )
               ) FILTER (WHERE p.id IS NOT NULL),
               '[]'
             ) as products
      FROM combos c
      LEFT JOIN combo_products cp ON cp.combo_id = c.id
      LEFT JOIN products p ON p.id = cp.product_id
      WHERE c.branch_id = $1
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.created_at DESC
    `;

    const result = await this.databaseService.query<any>(sql, [branchId]);
    return result.rows;
  }

  async findOne(branchId: string, id: string): Promise<ComboResponseDto> {
    this.logger.log(`Finding combo ${id} for branch: ${branchId}`);

    const sql = `
      SELECT c.*, 
             COALESCE(
               jsonb_agg(
                 jsonb_build_object(
                   'product_id', p.id,
                   'name', p.name,
                   'quantity', cp.quantity,
                   'image_url', p.image_url
                 )
               ) FILTER (WHERE p.id IS NOT NULL),
               '[]'
             ) as products
      FROM combos c
      LEFT JOIN combo_products cp ON cp.combo_id = c.id
      LEFT JOIN products p ON p.id = cp.product_id
      WHERE c.id = $1 AND c.branch_id = $2
      GROUP BY c.id
    `;

    const result = await this.databaseService.query<any>(sql, [id, branchId]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Combo with ID ${id} not found in this branch`);
    }

    return result.rows[0];
  }

  async create(branchId: string, createDto: CreateComboDto): Promise<ComboResponseDto> {
    this.logger.log(`Creating combo for branch: ${branchId}`);

    // 1. Verificar límites de plan
    const isWithinLimit = await this.isWithinLimit(branchId);
    if (!isWithinLimit) {
      throw new ForbiddenException('Has alcanzado el límite de combos de tu plan actual.');
    }

    // 2. Validar que los productos pertenezcan a la sucursal
    const productIds = createDto.products.map((p) => p.product_id);
    await this.validateProductsInBranch(branchId, productIds);

    // 3. Manejo de imagen en Cloudinary
    let cloudinaryData: { secure_url: string | null; public_id: string | null } = {
      secure_url: null,
      public_id: null,
    };
    if (createDto.image_base64) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        createDto.image_base64,
        'combos',
      );
      cloudinaryData = {
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    // 4. Inserción transaccional (Combo + ComboProducts)
    try {
      const combo = await this.databaseService.transaction(async (client) => {
        // Insertar Combo
        const comboResult = await client.query<any>(
          `INSERT INTO combos (branch_id, name, description, price, image_url, cloudinary_id, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            branchId,
            createDto.name,
            createDto.description || null,
            createDto.price,
            cloudinaryData.secure_url,
            cloudinaryData.public_id,
            createDto.display_order || 0,
          ],
        );

        const newCombo = comboResult.rows[0];

        // Insertar ComboProducts
        for (const item of createDto.products) {
          await client.query(
            `INSERT INTO combo_products (combo_id, product_id, quantity)
             VALUES ($1, $2, $3)`,
            [newCombo.id, item.product_id, item.quantity],
          );
        }

        return newCombo;
      });

      return this.findOne(branchId, combo.id);
    } catch (err) {
      if (cloudinaryData.public_id) {
        await this.cloudinaryService.deleteImage(cloudinaryData.public_id);
      }
      throw err;
    }
  }

  async update(
    branchId: string,
    id: string,
    updateDto: UpdateComboDto,
  ): Promise<ComboResponseDto> {
    this.logger.log(`Updating combo ${id} for branch: ${branchId}`);

    const existing = await this.findOne(branchId, id);

    // Si hay nuevos productos, validar que pertenezcan a la sucursal
    if (updateDto.products) {
      const productIds = updateDto.products.map((p) => p.product_id);
      await this.validateProductsInBranch(branchId, productIds);
    }

    await this.databaseService.transaction(async (client) => {
      // 1. Actualizar campos básicos de combos
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (updateDto.name !== undefined) {
        fields.push(`name = $${idx++}`);
        values.push(updateDto.name);
      }
      if (updateDto.description !== undefined) {
        fields.push(`description = $${idx++}`);
        values.push(updateDto.description);
      }
      if (updateDto.price !== undefined) {
        fields.push(`price = $${idx++}`);
        values.push(updateDto.price);
      }
      if (updateDto.display_order !== undefined) {
        fields.push(`display_order = $${idx++}`);
        values.push(updateDto.display_order);
      }
      if (updateDto.is_active !== undefined) {
        fields.push(`is_active = $${idx++}`);
        values.push(updateDto.is_active);
      }

      if (fields.length > 0) {
        values.push(id);
        values.push(branchId);
        await client.query(
          `UPDATE combos SET ${fields.join(', ')}, updated_at = NOW() 
           WHERE id = $${idx++} AND branch_id = $${idx++}`,
          values,
        );
      }

      // 2. Si hay productos, sincronizarlos (borrar y re-insertar para simplicidad)
      if (updateDto.products) {
        await client.query('DELETE FROM combo_products WHERE combo_id = $1', [id]);
        for (const item of updateDto.products) {
          await client.query(
            `INSERT INTO combo_products (combo_id, product_id, quantity)
             VALUES ($1, $2, $3)`,
            [id, item.product_id, item.quantity],
          );
        }
      }
    });

    return this.findOne(branchId, id);
  }

  async remove(branchId: string, id: string): Promise<void> {
    this.logger.log(`Removing combo ${id} for branch: ${branchId}`);

    const result = await this.databaseService.query<{ cloudinary_id: string }>(
      'DELETE FROM combos WHERE id = $1 AND branch_id = $2 RETURNING cloudinary_id',
      [id, branchId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Combo with ID ${id} not found or access denied`);
    }

    const cloudinaryId = result.rows[0].cloudinary_id;
    if (cloudinaryId) {
      await this.cloudinaryService.deleteImage(cloudinaryId);
    }
  }

  async reorder(branchId: string, comboIds: string[]): Promise<void> {
    this.logger.log(`Reordering combos for branch: ${branchId}`);

    await this.databaseService.transaction(async (client) => {
      for (let i = 0; i < comboIds.length; i++) {
        await client.query(
          'UPDATE combos SET display_order = $1 WHERE id = $2 AND branch_id = $3',
          [i, comboIds[i], branchId],
        );
      }
    });
  }

  // --- Helpers ---

  private async isWithinLimit(branchId: string): Promise<boolean> {
    const res = await this.databaseService.query<{ is_within: boolean }>(
      'SELECT branch_within_combo_limit($1) as is_within',
      [branchId],
    );
    return res.rows[0]?.is_within ?? true;
  }

  private async validateProductsInBranch(branchId: string, productIds: string[]): Promise<void> {
    if (productIds.length === 0) return;

    const result = await this.databaseService.query<{ count: string }>(
      'SELECT COUNT(*) FROM products WHERE id = ANY($1) AND branch_id = $2',
      [productIds, branchId],
    );

    if (parseInt(result.rows[0].count) !== productIds.length) {
      throw new BadRequestException(
        'Uno o más productos no existen o no pertenecen a esta sucursal.',
      );
    }
  }
}
