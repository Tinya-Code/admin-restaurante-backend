import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { RestaurantSettingsResponseDto } from './dto/restaurant-settings-response.dto';
import { UpdateRestaurantSettingsDto } from './dto/update-restaurant-settings.dto';
import { BannerResponseDto } from './dto/banner-response.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getBusinessSettings(
    restaurantId: string,
  ): Promise<RestaurantSettingsResponseDto> {
    this.logger.log(
      `Getting business settings for restaurant: ${restaurantId}`,
    );

    // First verify restaurant exists
    const restaurantExists = await this.databaseService.findOne('restaurants', {
      id: restaurantId,
    });

    if (!restaurantExists) {
      throw new NotFoundException(
        `No restaurant found with id: ${restaurantId}`,
      );
    }

    // Get restaurant settings
    const result =
      await this.databaseService.query<RestaurantSettingsResponseDto>(
        'SELECT * FROM restaurant_settings WHERE restaurant_id = $1',
        [restaurantId],
      );

    if (result.rows.length === 0) {
      // Return default settings if none exist
      return {
        restaurant_id: restaurantId,
        whatsapp_config: {},
        display_config: {},
        order_config: {},
        business_config: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return result.rows[0];
  }

  async updateBusinessSettings(
    restaurantId: string,
    updateData: UpdateRestaurantSettingsDto,
  ): Promise<RestaurantSettingsResponseDto> {
    this.logger.log(
      `Updating business settings for restaurant: ${restaurantId}`,
    );

    // First verify restaurant exists
    const restaurantExists = await this.databaseService.findOne('restaurants', {
      id: restaurantId,
    });

    if (!restaurantExists) {
      throw new NotFoundException(
        `No restaurant found with id: ${restaurantId}`,
      );
    }

    // Check if settings already exist
    const existingSettings = await this.databaseService.query(
      'SELECT id FROM restaurant_settings WHERE restaurant_id = $1',
      [restaurantId],
    );

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query based on provided fields
    if (updateData.whatsapp_config !== undefined) {
      updateFields.push(`whatsapp_config = $${paramIndex++}`);
      updateValues.push(JSON.stringify(updateData.whatsapp_config));
    }

    if (updateData.display_config !== undefined) {
      updateFields.push(`display_config = $${paramIndex++}`);
      updateValues.push(JSON.stringify(updateData.display_config));
    }

    if (updateData.order_config !== undefined) {
      updateFields.push(`order_config = $${paramIndex++}`);
      updateValues.push(JSON.stringify(updateData.order_config));
    }

    if (updateData.business_config !== undefined) {
      updateFields.push(`business_config = $${paramIndex++}`);
      updateValues.push(JSON.stringify(updateData.business_config));
    }

    if (updateFields.length === 0) {
      // No fields to update, return existing settings
      return this.getBusinessSettings(restaurantId);
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex++}`);
    updateValues.push(new Date().toISOString());

    updateValues.push(restaurantId); // Add restaurant_id as last parameter

    let result;

    if (existingSettings.rows.length > 0) {
      // Update existing settings
      const updateQuery = `
        UPDATE restaurant_settings 
        SET ${updateFields.join(', ')} 
        WHERE restaurant_id = $${paramIndex} 
        RETURNING *
      `;

      result = await this.databaseService.query<RestaurantSettingsResponseDto>(
        updateQuery,
        updateValues,
      );
    } else {
      // Insert new settings
      const defaultConfigs = {
        whatsapp_config: updateData.whatsapp_config || {},
        display_config: updateData.display_config || {},
        order_config: updateData.order_config || {},
        business_config: updateData.business_config || {},
      };

      const insertQuery = `
        INSERT INTO restaurant_settings (
          restaurant_id, 
          whatsapp_config, 
          display_config, 
          order_config, 
          business_config,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        ) RETURNING *
      `;

      result = await this.databaseService.query<RestaurantSettingsResponseDto>(
        insertQuery,
        [
          restaurantId,
          JSON.stringify(defaultConfigs.whatsapp_config),
          JSON.stringify(defaultConfigs.display_config),
          JSON.stringify(defaultConfigs.order_config),
          JSON.stringify(defaultConfigs.business_config),
          new Date().toISOString(),
          new Date().toISOString(),
        ],
      );
    }

    return result.rows[0];
  }

  // --- Banners Methods ---

  async getBanners(restaurantId: string): Promise<BannerResponseDto[]> {
    this.logger.log(`Getting banners for restaurant: ${restaurantId}`);
    
    const result = await this.databaseService.query<BannerResponseDto>(
      'SELECT * FROM banners WHERE restaurant_id = $1 ORDER BY display_order ASC, created_at DESC',
      [restaurantId],
    );
    
    return result.rows;
  }

  async createBanner(
    restaurantId: string,
    createDto: CreateBannerDto,
  ): Promise<BannerResponseDto> {
    this.logger.log(`Creating banner for restaurant: ${restaurantId}`);

    // Upload image to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadImage(
      createDto.image_base64,
      'banners',
    );

    const result = await this.databaseService.query<BannerResponseDto>(
      `INSERT INTO banners (restaurant_id, image_url, description, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        restaurantId,
        uploadResult.secure_url,
        createDto.description || null,
        createDto.display_order || 0,
      ],
    );

    return result.rows[0];
  }

  async updateBanner(
    restaurantId: string,
    bannerId: string,
    updateDto: UpdateBannerDto,
  ): Promise<BannerResponseDto> {
    this.logger.log(`Updating banner ${bannerId} for restaurant: ${restaurantId}`);

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updateDto.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(updateDto.description);
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
      const current = await this.databaseService.query<BannerResponseDto>(
        'SELECT * FROM banners WHERE id = $1 AND restaurant_id = $2',
        [bannerId, restaurantId],
      );
      if (current.rows.length === 0) throw new NotFoundException('Banner not found');
      return current.rows[0];
    }

    fields.push(`updated_at = $${idx++}`);
    values.push(new Date().toISOString());

    values.push(bannerId);
    values.push(restaurantId);

    const result = await this.databaseService.query<BannerResponseDto>(
      `UPDATE banners SET ${fields.join(', ')} 
       WHERE id = $${idx++} AND restaurant_id = $${idx++}
       RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Banner not found');
    }

    return result.rows[0];
  }

  async deleteBanner(restaurantId: string, bannerId: string): Promise<void> {
    this.logger.log(`Deleting banner ${bannerId} for restaurant: ${restaurantId}`);

    const result = await this.databaseService.query<BannerResponseDto>(
      'DELETE FROM banners WHERE id = $1 AND restaurant_id = $2 RETURNING image_url',
      [bannerId, restaurantId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Banner not found');
    }

    // Delete image from Cloudinary
    await this.cloudinaryService.deleteImage(result.rows[0].image_url);
  }

  async reorderBanners(restaurantId: string, bannerIds: string[]): Promise<void> {
    this.logger.log(`Reordering banners for restaurant: ${restaurantId}`);

    // Simple implementation: update each banner's order in a transaction
    await this.databaseService.transaction(async (client) => {
      for (let i = 0; i < bannerIds.length; i++) {
        await client.query(
          'UPDATE banners SET display_order = $1 WHERE id = $2 AND restaurant_id = $3',
          [i, bannerIds[i], restaurantId],
        );
      }
    });
  }
}
