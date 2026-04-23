import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreatePromotionDto, PromotionAppliesTo } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionResponseDto } from './dto/promotion-response.dto';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(branchId: string): Promise<PromotionResponseDto[]> {
    this.logger.log(`Finding all promotions for branch: ${branchId}`);

    const sql = `
      SELECT p.*,
             CASE 
               WHEN p.applies_to = 'product' THEN (SELECT name FROM products WHERE id = p.target_id)
               WHEN p.applies_to = 'category' THEN (SELECT name FROM categories WHERE id = p.target_id)
               WHEN p.applies_to = 'combo' THEN (SELECT name FROM combos WHERE id = p.target_id)
               ELSE NULL
             END as target_name
      FROM promotions p
      WHERE p.branch_id = $1
      ORDER BY p.created_at DESC
    `;

    const result = await this.databaseService.query<PromotionResponseDto>(sql, [branchId]);
    return result.rows;
  }

  async findOne(branchId: string, id: string): Promise<PromotionResponseDto> {
    this.logger.log(`Finding promotion ${id} for branch: ${branchId}`);

    const sql = `
      SELECT p.*,
             CASE 
               WHEN p.applies_to = 'product' THEN (SELECT name FROM products WHERE id = p.target_id)
               WHEN p.applies_to = 'category' THEN (SELECT name FROM categories WHERE id = p.target_id)
               WHEN p.applies_to = 'combo' THEN (SELECT name FROM combos WHERE id = p.target_id)
               ELSE NULL
             END as target_name
      FROM promotions p
      WHERE p.id = $1 AND p.branch_id = $2
    `;

    const result = await this.databaseService.query<PromotionResponseDto>(sql, [id, branchId]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Promotion with ID ${id} not found in this branch`);
    }

    return result.rows[0];
  }

  async create(branchId: string, createDto: CreatePromotionDto): Promise<PromotionResponseDto> {
    this.logger.log(`Creating promotion for branch: ${branchId}`);

    // 1. Verificar límites de plan
    const isWithinLimit = await this.isWithinLimit(branchId);
    if (!isWithinLimit) {
      throw new ForbiddenException('Has alcanzado el límite de promociones de tu plan actual.');
    }

    // 2. Validar rango de fechas
    if (createDto.start_date && createDto.end_date) {
      if (new Date(createDto.end_date) <= new Date(createDto.start_date)) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio.');
      }
    }

    // 3. Validar target_id si aplica
    if (createDto.applies_to !== PromotionAppliesTo.BRANCH) {
      if (!createDto.target_id) {
        throw new BadRequestException('target_id es requerido para este tipo de promoción.');
      }
      await this.validateTargetInBranch(branchId, createDto.applies_to, createDto.target_id);
    }

    // 4. Inserción
    const sql = `
      INSERT INTO promotions (
        branch_id, name, description, discount_type, discount_value, 
        applies_to, target_id, start_date, end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await this.databaseService.query<PromotionResponseDto>(sql, [
      branchId,
      createDto.name,
      createDto.description || null,
      createDto.discount_type,
      createDto.discount_value,
      createDto.applies_to,
      createDto.target_id || null,
      createDto.start_date || null,
      createDto.end_date || null,
    ]);

    return this.findOne(branchId, result.rows[0].id);
  }

  async update(
    branchId: string,
    id: string,
    updateDto: UpdatePromotionDto,
  ): Promise<PromotionResponseDto> {
    this.logger.log(`Updating promotion ${id} for branch: ${branchId}`);

    const existing = await this.findOne(branchId, id);

    // Validar rango de fechas si se envían
    const startDate = updateDto.start_date || (existing.start_date ? existing.start_date.toISOString() : null);
    const endDate = updateDto.end_date || (existing.end_date ? existing.end_date.toISOString() : null);

    if (startDate && endDate) {
      if (new Date(endDate) <= new Date(startDate)) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio.');
      }
    }

    // Validar nuevo target si se cambia
    if (updateDto.applies_to || updateDto.target_id) {
      const appliesTo = updateDto.applies_to || existing.applies_to;
      const targetId = updateDto.target_id || existing.target_id;

      if (appliesTo !== PromotionAppliesTo.BRANCH) {
        if (!targetId) {
          throw new BadRequestException('target_id es requerido para este tipo de promoción.');
        }
        await this.validateTargetInBranch(branchId, appliesTo, targetId);
      }
    }

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const mapping = {
      name: 'name',
      description: 'description',
      discount_type: 'discount_type',
      discount_value: 'discount_value',
      applies_to: 'applies_to',
      target_id: 'target_id',
      start_date: 'start_date',
      end_date: 'end_date',
      is_active: 'is_active',
    };

    for (const [dtoKey, dbKey] of Object.entries(mapping)) {
      if (updateDto[dtoKey] !== undefined) {
        fields.push(`${dbKey} = $${idx++}`);
        values.push(updateDto[dtoKey]);
      }
    }

    if (fields.length === 0) {
      return existing;
    }

    values.push(id);
    values.push(branchId);

    const sql = `
      UPDATE promotions 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${idx++} AND branch_id = $${idx++}
      RETURNING *
    `;

    const result = await this.databaseService.query<PromotionResponseDto>(sql, values);

    if (result.rows.length === 0) {
      throw new NotFoundException('Promotion not found or access denied');
    }

    return this.findOne(branchId, id);
  }

  async remove(branchId: string, id: string): Promise<void> {
    this.logger.log(`Removing promotion ${id} for branch: ${branchId}`);

    const result = await this.databaseService.query(
      'DELETE FROM promotions WHERE id = $1 AND branch_id = $2',
      [id, branchId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Promotion with ID ${id} not found or access denied`);
    }
  }

  // --- Helpers ---

  private async isWithinLimit(branchId: string): Promise<boolean> {
    const res = await this.databaseService.query<{ is_within: boolean }>(
      'SELECT branch_within_promotion_limit($1) as is_within',
      [branchId],
    );
    return res.rows[0]?.is_within ?? true;
  }

  private async validateTargetInBranch(
    branchId: string,
    appliesTo: PromotionAppliesTo,
    targetId: string,
  ): Promise<void> {
    let table = '';
    let condition = 'id = $1 AND branch_id = $2';

    switch (appliesTo) {
      case PromotionAppliesTo.PRODUCT:
        table = 'products';
        break;
      case PromotionAppliesTo.CATEGORY:
        table = 'categories';
        // Categorías se validan vía menú
        condition = 'id = $1 AND menu_id IN (SELECT id FROM menus WHERE branch_id = $2)';
        break;
      case PromotionAppliesTo.COMBO:
        table = 'combos';
        break;
      default:
        return;
    }

    const sql = `SELECT 1 FROM ${table} WHERE ${condition}`;
    const result = await this.databaseService.query(sql, [targetId, branchId]);

    if (result.rows.length === 0) {
      throw new BadRequestException(
        `El recurso de destino (${appliesTo}: ${targetId}) no existe en esta sucursal.`,
      );
    }
  }
}
