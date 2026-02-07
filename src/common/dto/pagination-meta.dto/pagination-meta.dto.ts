export class PaginationMetaDto {
  limit: number;
  current_page: number;
  total_pages: number;
  total_items: number;
  has_next: boolean;
  has_prev: boolean;
  order_by?: string;
  sort_direction?: 'ASC' | 'DESC';
}