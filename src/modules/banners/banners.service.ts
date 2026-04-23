import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { BannerResponseDto } from './dto/banner-response.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getBanners(branchId: string): Promise<BannerResponseDto[]> {
    this.logger.log(`Getting banners for branch: ${branchId}`);
    
    const result = await this.databaseService.query<BannerResponseDto>(
      'SELECT * FROM banners WHERE branch_id = $1 ORDER BY display_order ASC, created_at DESC',
      [branchId],
    );
    
    return result.rows;
  }

  async createBanner(
    branchId: string,
    createDto: CreateBannerDto,
  ): Promise<BannerResponseDto> {
    this.logger.log(`Creating banner for branch: ${branchId}`);

    const isWithinLimit = await this.isWithinBannerLimit(branchId);
    if (!isWithinLimit) {
      throw new ForbiddenException('Has alcanzado el límite de banners de tu plan actual.');
    }

    const uploadResult = await this.cloudinaryService.uploadImage(
      createDto.image_base64,
      'banners',
    );

    try {
      const result = await this.databaseService.query<BannerResponseDto>(
        `INSERT INTO banners (branch_id, image_url, cloudinary_id, link_url, description, display_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          branchId,
          uploadResult.secure_url,
          uploadResult.public_id,
          createDto.link_url || null,
          createDto.description || null,
          createDto.display_order || 0,
        ],
      );
      return result.rows[0];
    } catch (err: any) {
      await this.cloudinaryService.deleteImage(uploadResult.public_id);
      if (err?.message?.startsWith('PLAN_LIMIT_EXCEEDED:')) {
        throw new ForbiddenException(err.message.replace('PLAN_LIMIT_EXCEEDED: ', ''));
      }
      throw err;
    }
  }

  async updateBanner(
    branchId: string,
    bannerId: string,
    updateDto: UpdateBannerDto,
  ): Promise<BannerResponseDto> {
    this.logger.log(`Updating banner ${bannerId} for branch: ${branchId}`);

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updateDto.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(updateDto.description);
    }
    if (updateDto.link_url !== undefined) {
      fields.push(`link_url = $${idx++}`);
      values.push(updateDto.link_url);
    }
    if (updateDto.display_order !== undefined) {
      fields.push(`display_order = $${idx++}`);
      values.push(updateDto.display_order);
    }
    if (updateDto.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(updateDto.is_active);
    }

    if (fields.length === 0) {
      return this.getBannerById(branchId, bannerId);
    }

    values.push(bannerId);
    values.push(branchId);

    const result = await this.databaseService.query<BannerResponseDto>(
      `UPDATE banners SET ${fields.join(', ')}, updated_at = NOW() 
       WHERE id = $${idx++} AND branch_id = $${idx++}
       RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Banner not found or access denied');
    }

    return result.rows[0];
  }

  async deleteBanner(branchId: string, bannerId: string): Promise<void> {
    this.logger.log(`Deleting banner ${bannerId} for branch: ${branchId}`);

    const result = await this.databaseService.query<{ cloudinary_id: string }>(
      'DELETE FROM banners WHERE id = $1 AND branch_id = $2 RETURNING cloudinary_id',
      [bannerId, branchId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Banner not found or access denied');
    }

    if (result.rows[0].cloudinary_id) {
      await this.cloudinaryService.deleteImage(result.rows[0].cloudinary_id);
    }
  }

  async reorderBanners(branchId: string, bannerIds: string[]): Promise<void> {
    this.logger.log(`Reordering banners for branch: ${branchId}`);

    await this.databaseService.transaction(async (client) => {
      for (let i = 0; i < bannerIds.length; i++) {
        await client.query(
          'UPDATE banners SET display_order = $1 WHERE id = $2 AND branch_id = $3',
          [i, bannerIds[i], branchId],
        );
      }
    });
  }

  private async getBannerById(branchId: string, bannerId: string): Promise<BannerResponseDto> {
    const result = await this.databaseService.query<BannerResponseDto>(
      'SELECT * FROM banners WHERE id = $1 AND branch_id = $2',
      [bannerId, branchId],
    );
    if (result.rows.length === 0) throw new NotFoundException('Banner not found');
    return result.rows[0];
  }

  private async isWithinBannerLimit(branchId: string): Promise<boolean> {
    const sql = 'SELECT branch_within_banner_limit($1) AS is_within';
    const res = await this.databaseService.query(sql, [branchId]);
    return res.rows[0]?.is_within ?? true;
  }
}
