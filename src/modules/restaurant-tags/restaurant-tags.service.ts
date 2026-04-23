import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { TagResponseDto } from './dto/tag-response.dto';
import { UpdateRestaurantTagsDto } from './dto/update-restaurant-tags.dto';

@Injectable()
export class RestaurantTagsService {
  private readonly logger = new Logger(RestaurantTagsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async findAllGlobalTags(): Promise<TagResponseDto[]> {
    this.logger.log('Fetching all global tags');
    const result = await this.databaseService.query<TagResponseDto>(
      'SELECT id, name FROM tags ORDER BY name ASC',
    );
    return result.rows;
  }

  async findRestaurantTags(restaurantId: string): Promise<TagResponseDto[]> {
    this.logger.log(`Fetching tags for restaurant: ${restaurantId}`);
    const sql = `
      SELECT t.id, t.name
      FROM tags t
      JOIN restaurant_tags rt ON rt.tag_id = t.id
      WHERE rt.restaurant_id = $1
      ORDER BY t.name ASC
    `;
    const result = await this.databaseService.query<TagResponseDto>(sql, [restaurantId]);
    return result.rows;
  }

  async syncRestaurantTags(
    restaurantId: string,
    updateDto: UpdateRestaurantTagsDto,
  ): Promise<TagResponseDto[]> {
    this.logger.log(`Syncing tags for restaurant: ${restaurantId}`);

    await this.databaseService.transaction(async (client) => {
      // 1. Eliminar etiquetas actuales
      await client.query('DELETE FROM restaurant_tags WHERE restaurant_id = $1', [
        restaurantId,
      ]);

      // 2. Insertar nuevas etiquetas si las hay
      if (updateDto.tag_ids.length > 0) {
        const values: any[] = [];
        const placeholders: string[] = [];

        updateDto.tag_ids.forEach((tagId, index) => {
          values.push(restaurantId, tagId);
          placeholders.push(`($${index * 2 + 1}, $${index * 2 + 2})`);
        });

        const sql = `
          INSERT INTO restaurant_tags (restaurant_id, tag_id)
          VALUES ${placeholders.join(', ')}
        `;
        await client.query(sql, values);
      }
    });

    return this.findRestaurantTags(restaurantId);
  }
}
