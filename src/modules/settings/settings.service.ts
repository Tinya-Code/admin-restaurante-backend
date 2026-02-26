import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { RestaurantSettingsResponseDto } from './dto/restaurant-settings-response.dto';
import { UpdateRestaurantSettingsDto } from './dto/update-restaurant-settings.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

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
}
