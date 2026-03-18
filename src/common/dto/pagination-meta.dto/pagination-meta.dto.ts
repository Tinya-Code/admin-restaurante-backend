import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  current_page: number;

  @ApiProperty({ example: 10 })
  total_pages: number;

  @ApiProperty({ example: 100 })
  total_items: number;

  @ApiProperty({ example: true })
  has_next: boolean;

  @ApiProperty({ example: false })
  has_prev: boolean;

  @ApiProperty({ example: 'display_order', required: false })
  order_by?: string;

  @ApiProperty({ example: 'ASC', enum: ['ASC', 'DESC'], required: false })
  sort_direction?: 'ASC' | 'DESC';

  constructor(
    page: number,
    limit: number,
    total: number,
    orderBy?: string,
    sortDirection?: 'ASC' | 'DESC',
  ) {
    this.current_page = page;
    this.limit = limit;
    this.total_items = total;
    this.total_pages = Math.ceil(total / limit);
    this.has_next = page < this.total_pages;
    this.has_prev = page > 1;
    this.order_by = orderBy;
    this.sort_direction = sortDirection;
  }
}
