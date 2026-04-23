import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CategoriesCountResponseDto } from './dto/categories-count-response.dto';
import { ProductsCountResponseDto } from './dto/products-count-response.dto';
import { RecentProductsResponseDto } from './dto/recent-products-response.dto';
import { CombosCountResponseDto } from './dto/combos-count-response.dto';
import { VisitsOverviewResponseDto } from './dto/visits-overview-response.dto';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(private readonly db: DatabaseService) {}

  async getProductsCount(branchId: string): Promise<ProductsCountResponseDto> {
    this.logger.log(`Getting products count for branch: ${branchId}`);

    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM products WHERE branch_id = $1`,
      [branchId],
    );

    const totalProducts = parseInt(result.rows[0].count);

    return {
      branch_id: branchId,
      total_products: totalProducts,
    };
  }

  async getCategoriesCount(branchId: string): Promise<CategoriesCountResponseDto> {
    this.logger.log(`Getting categories count for branch: ${branchId}`);

    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count 
       FROM categories c
       JOIN menus m ON m.id = c.menu_id
       WHERE m.branch_id = $1`,
      [branchId],
    );

    const totalCategories = parseInt(result.rows[0].count);

    return {
      branch_id: branchId,
      total_categories: totalCategories,
    };
  }

  async getRecentProducts(branchId: string, limit?: number): Promise<RecentProductsResponseDto> {
    const actualLimit = limit || 5;
    this.logger.log(`Getting recent products for branch: ${branchId}, limit: ${actualLimit}`);

    const result = await this.db.query<{
      id: string;
      name: string;
      price: string;
      category_id: string;
      created_at: string;
    }>(
      `SELECT id, name, price, category_id, created_at 
       FROM products 
       WHERE branch_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [branchId, actualLimit],
    );

    const products = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      category_id: row.category_id,
      created_at: row.created_at,
    }));

    return {
      branch_id: branchId,
      products,
    };
  }

  async getCombosCount(branchId: string): Promise<CombosCountResponseDto> {
    this.logger.log(`Getting combos count for branch: ${branchId}`);

    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM combos WHERE branch_id = $1`,
      [branchId],
    );

    return {
      branch_id: branchId,
      total_combos: parseInt(result.rows[0].count),
    };
  }

  async getVisitsOverview(branchId: string): Promise<VisitsOverviewResponseDto> {
    this.logger.log(`Getting visits overview for branch: ${branchId}`);

    const breakdownRes = await this.db.query<{ visit_type: string; count: string }>(
      `SELECT visit_type, COUNT(*) as count 
       FROM restaurant_visits 
       WHERE branch_id = $1 
       GROUP BY visit_type`,
      [branchId],
    );

    const breakdown = breakdownRes.rows.map((row) => ({
      type: row.visit_type,
      count: parseInt(row.count),
    }));

    const totalVisits = breakdown.reduce((acc, curr) => acc + curr.count, 0);

    return {
      branch_id: branchId,
      total_visits: totalVisits,
      breakdown,
    };
  }
}
