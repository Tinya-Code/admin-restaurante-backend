import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { RestaurantProfileResponseDto } from './dto/restaurant-settings-response.dto';
import { UpdateRestaurantProfileDto } from './dto/update-restaurant-settings.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { UpdateBranchSettingsDto } from './dto/update-branch-settings.dto';
import { BranchSettingsResponseDto } from './dto/branch-settings-response.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // --- Restaurant Profile Methods ---

  async getRestaurantProfile(
    restaurantId: string,
  ): Promise<RestaurantProfileResponseDto> {
    this.logger.log(`Getting profile for restaurant: ${restaurantId}`);

    const result = await this.databaseService.query<RestaurantProfileResponseDto>(
      `SELECT r.id, r.name, r.slug, r.phone, r.address, r.is_active,
              r.created_at, r.updated_at,
              p.name AS plan_name, p.description AS plan_description
       FROM restaurants r
       LEFT JOIN plans p ON p.id = r.plan_id
       WHERE r.id = $1`,
      [restaurantId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`No profile found for restaurant: ${restaurantId}`);
    }

    return result.rows[0];
  }

  async updateRestaurantProfile(
    restaurantId: string,
    updateData: UpdateRestaurantProfileDto,
  ): Promise<RestaurantProfileResponseDto> {
    this.logger.log(`Updating profile for restaurant: ${restaurantId}`);

    if (Object.keys(updateData).length === 0) {
      return this.getRestaurantProfile(restaurantId);
    }

    const query = `
      UPDATE restaurants
      SET
        name    = COALESCE($2, name),
        phone   = COALESCE($3, phone),
        address = COALESCE($4, address),
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, slug, phone, address, is_active, updated_at
    `;

    const values = [
      restaurantId,
      updateData.name ?? null,
      updateData.phone ?? null,
      updateData.address ?? null,
    ];

    const result = await this.databaseService.query<RestaurantProfileResponseDto>(query, values);
    
    if (result.rows.length === 0) {
      throw new NotFoundException(`No profile found for restaurant: ${restaurantId}`);
    }

    // Retornamos el perfil completo con el plan
    return this.getRestaurantProfile(restaurantId);
  }

  // --- Branch Settings Methods ---

  async getBranchSettings(
    branchId: string,
  ): Promise<BranchSettingsResponseDto> {
    this.logger.log(`Getting settings for branch: ${branchId}`);

    const result = await this.databaseService.query<BranchSettingsResponseDto>(
      `SELECT bs.id, bs.branch_id, bs.whatsapp_config, bs.display_config,
              bs.order_config, bs.business_config, bs.logo_url,
              bs.logo_cloudinary_id, bs.description, bs.schedule,
              bs.created_at, bs.updated_at
       FROM branch_settings bs
       WHERE bs.branch_id = $1`,
      [branchId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`No settings found for branch: ${branchId}`);
    }

    return result.rows[0];
  }

  async updateBranchSettings(
    branchId: string,
    updateData: UpdateBranchSettingsDto,
  ): Promise<BranchSettingsResponseDto> {
    this.logger.log(`Updating settings for branch: ${branchId}`);

    if (Object.keys(updateData).length === 0) {
      return this.getBranchSettings(branchId);
    }

    const query = `
      UPDATE branch_settings
      SET
        whatsapp_config    = CASE WHEN $2::jsonb IS NOT NULL
                                  THEN whatsapp_config || $2::jsonb
                                  ELSE whatsapp_config END,
        display_config     = CASE WHEN $3::jsonb IS NOT NULL
                                  THEN display_config  || $3::jsonb
                                  ELSE display_config  END,
        order_config       = CASE WHEN $4::jsonb IS NOT NULL
                                  THEN order_config    || $4::jsonb
                                  ELSE order_config    END,
        business_config    = CASE WHEN $5::jsonb IS NOT NULL
                                  THEN business_config || $5::jsonb
                                  ELSE business_config END,
        schedule           = CASE WHEN $6::jsonb IS NOT NULL
                                  THEN schedule        || $6::jsonb
                                  ELSE schedule        END,
        logo_url           = COALESCE($7, logo_url),
        logo_cloudinary_id = COALESCE($8, logo_cloudinary_id),
        description        = COALESCE($9, description),
        updated_at         = NOW()
      WHERE branch_id = $1
      RETURNING id, branch_id, whatsapp_config, display_config, order_config, business_config, logo_url, logo_cloudinary_id, description, schedule, created_at, updated_at
    `;

    const values = [
      branchId,
      updateData.whatsapp_config ? JSON.stringify(updateData.whatsapp_config) : null,
      updateData.display_config ? JSON.stringify(updateData.display_config) : null,
      updateData.order_config ? JSON.stringify(updateData.order_config) : null,
      updateData.business_config ? JSON.stringify(updateData.business_config) : null,
      updateData.schedule ? JSON.stringify(updateData.schedule) : null,
      updateData.logo_url ?? null,
      updateData.logo_cloudinary_id ?? null,
      updateData.description ?? null,
    ];

    const result = await this.databaseService.query<BranchSettingsResponseDto>(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`No settings found for branch: ${branchId}`);
    }

    return result.rows[0];
  }
}

