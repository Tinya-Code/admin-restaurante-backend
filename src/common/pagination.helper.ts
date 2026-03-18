export interface PaginationMeta {
  limit: number;
  current_page: number;
  total_pages: number;
  total_items: number;
  has_next: boolean;
  has_prev: boolean;
}

export function buildPaginationMeta(
  totalItems: number,
  page: number,
  limit: number,
): PaginationMeta {
  const total_pages = Math.max(1, Math.ceil(totalItems / limit));
  const current_page = Math.min(Math.max(1, page), total_pages);
  return {
    limit,
    current_page,
    total_pages,
    total_items: totalItems,
    has_next: current_page < total_pages,
    has_prev: current_page > 1,
  };
}
