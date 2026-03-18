import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CategoriesCountResponseDto } from './dto/categories-count-response.dto';
import { ProductsCountResponseDto } from './dto/products-count-response.dto';
import { RecentProductsResponseDto } from './dto/recent-products-response.dto';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async getProductsCount(
    restaurantId: string,
  ): Promise<ProductsCountResponseDto> {
    this.logger.log(`Getting products count for restaurant: ${restaurantId}`);

    // First verify restaurant exists
    const restaurantExists = await this.databaseService.findOne('restaurants', {
      id: restaurantId,
    });

    if (!restaurantExists) {
      throw new NotFoundException(
        `No restaurant found with id: ${restaurantId}`,
      );
    }

    // Count products using the restaurant_id index
    const result = await this.databaseService.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM products WHERE restaurant_id = $1',
      [restaurantId],
    );

    const totalProducts = parseInt(result.rows[0].count);

    return {
      restaurant_id: restaurantId,
      total_products: totalProducts,
    };
  }

  async getCategoriesCount(
    restaurantId: string,
  ): Promise<CategoriesCountResponseDto> {
    this.logger.log(`Getting categories count for restaurant: ${restaurantId}`);

    // First verify restaurant exists
    const restaurantExists = await this.databaseService.findOne('restaurants', {
      id: restaurantId,
    });

    if (!restaurantExists) {
      throw new NotFoundException(
        `No restaurant found with id: ${restaurantId}`,
      );
    }

    // Count categories using the restaurant_id index
    const result = await this.databaseService.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM categories WHERE restaurant_id = $1',
      [restaurantId],
    );

    const totalCategories = parseInt(result.rows[0].count);

    return {
      restaurant_id: restaurantId,
      total_categories: totalCategories,
    };
  }

  async getRecentProducts(
    restaurantId: string,
    limit?: number,
  ): Promise<RecentProductsResponseDto> {
    const actualLimit = limit || 5;
    this.logger.log(
      `Getting recent products for restaurant: ${restaurantId}, limit: ${actualLimit}`,
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

    // Get recent products ordered by created_at DESC using the created_at index
    const result = await this.databaseService.query<{
      id: string;
      name: string;
      price: string;
      category_id: string;
      created_at: string;
    }>(
      `SELECT id, name, price, category_id, created_at 
       FROM products 
       WHERE restaurant_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [restaurantId, actualLimit],
    );

    const products = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      category_id: row.category_id,
      created_at: row.created_at,
    }));

    return {
      restaurant_id: restaurantId,
      products,
    };
  }
}
