import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

export interface MenuRow {
  id: string;
  branch_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class MenusRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(branchId: string, dto: CreateMenuDto): Promise<MenuRow> {
    const data = {
      branch_id: branchId,
      name: dto.name,
      description: dto.description ?? null,
      is_active: dto.is_active ?? true,
      display_order: dto.display_order ?? 0,
    };
    return this.db.insert<MenuRow>('menus', data);
  }

  async findAllByBranch(branchId: string): Promise<MenuRow[]> {
    const sql = `
      SELECT id, branch_id, name, description, is_active, display_order, created_at, updated_at
      FROM menus
      WHERE branch_id = $1
      ORDER BY display_order ASC, created_at DESC
    `;
    const res = await this.db.query<MenuRow>(sql, [branchId]);
    return res.rows;
  }

  async findById(id: string): Promise<MenuRow | null> {
    const sql = `
      SELECT id, branch_id, name, description, is_active, display_order, created_at, updated_at
      FROM menus
      WHERE id = $1
    `;
    const res = await this.db.query<MenuRow>(sql, [id]);
    return res.rows[0] || null;
  }

  async findByIdAndBranch(id: string, branchId: string): Promise<MenuRow | null> {
    const sql = `
      SELECT id, branch_id, name, description, is_active, display_order, created_at, updated_at
      FROM menus
      WHERE id = $1 AND branch_id = $2
    `;
    const res = await this.db.query<MenuRow>(sql, [id, branchId]);
    return res.rows[0] || null;
  }

  async update(id: string, dto: UpdateMenuDto): Promise<MenuRow | null> {
    const cleanData = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined),
    );

    if (Object.keys(cleanData).length === 0) return null;

    return this.db.update<MenuRow>('menus', id, cleanData);
  }

  async delete(id: string): Promise<boolean> {
    return this.db.delete('menus', id);
  }
}
