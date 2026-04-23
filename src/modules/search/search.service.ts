import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { QuerySearchDto, SearchType } from './dto/query-search.dto';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto/pagination-meta.dto';

@Injectable()
export class SearchService {
  constructor(private readonly db: DatabaseService) {}

  async search(
    branchId: string,
    query: QuerySearchDto,
  ): Promise<{ data: any[]; meta: PaginationMetaDto }> {
    const { q, type = SearchType.ALL, menu_id, page = 1, limit = 10 } = query;
    let allItems: any[] = [];

    // Products query
    if (type === SearchType.ALL || type === SearchType.PRODUCTS) {
      const pParams: any[] = [branchId, `%${q}%`];
      let pWhere = 'p.branch_id = $1 AND p.name ILIKE $2';

      if (menu_id) {
        pParams.push(menu_id);
        pWhere += ` AND c.menu_id = $3`;
      }

      const pSql = `
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE ${pWhere}
      `;
      const pRes = await this.db.query(pSql, pParams);
      
      const products = pRes.rows.map(row => ({
        ...row,
        type: 'product'
      }));
      allItems.push(...products);
    }

    // Categories query
    if (type === SearchType.ALL || type === SearchType.CATEGORIES) {
      const cParams: any[] = [branchId, `%${q}%`];
      let cWhere = 'm.branch_id = $1 AND c.name ILIKE $2';

      if (menu_id) {
        cParams.push(menu_id);
        cWhere += ` AND c.menu_id = $3`;
      }

      const cSql = `
        SELECT c.*
        FROM categories c
        JOIN menus m ON m.id = c.menu_id
        WHERE ${cWhere}
      `;
      const cRes = await this.db.query(cSql, cParams);
      
      const categories = cRes.rows.map(row => ({
        ...row,
        type: 'category'
      }));
      allItems.push(...categories);
    }

    // Combos query
    if (type === SearchType.ALL || type === SearchType.PRODUCTS) { // Note: using PRODUCTS type or ALL for combos as they are sale items
      const coSql = `
        SELECT * FROM combos 
        WHERE branch_id = $1 AND name ILIKE $2
      `;
      const coRes = await this.db.query(coSql, [branchId, `%${q}%`]);
      const combos = coRes.rows.map(row => ({
        ...row,
        type: 'combo'
      }));
      allItems.push(...combos);
    }

    // Sort globally by name ascending
    allItems.sort((a, b) => a.name.localeCompare(b.name));

    const total = allItems.length;
    const offset = (page - 1) * limit;
    const paginatedItems = allItems.slice(offset, offset + limit);

    const meta = new PaginationMetaDto(page, limit, total, 'name', 'ASC');

    return { data: paginatedItems, meta };
  }
}