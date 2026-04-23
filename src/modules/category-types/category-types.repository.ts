import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CategoryTypeMetadata } from './dto/category-type-response.dto';

export interface CategoryTypeRow {
  id: string;
  name: string;
  metadata: CategoryTypeMetadata;
}

@Injectable()
export class CategoryTypesRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<CategoryTypeRow[]> {
    const query = `
      SELECT id, name, metadata
      FROM category_types
      ORDER BY (metadata->>'section')::int ASC
    `;
    const result = await this.db.query<CategoryTypeRow>(query);
    return result.rows;
  }
}
