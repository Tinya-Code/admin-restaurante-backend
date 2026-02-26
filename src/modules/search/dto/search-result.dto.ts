import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export interface Category {
  id: string;              
  restaurant_id: string;   
  name: string;
  is_active: boolean;
  created_at: string;      
  updated_at: string;       
}

export class SearchResultItemDto {
  @IsString()
  id: string;

  @IsString()
  category_name: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsBoolean()
  is_available: boolean;

  @IsString()
  created_at: string;

  @IsString()
  updated_at: string;
}

export class PaginationMeta {
  @IsNumber()
  limit: number;
  @IsNumber()
  current_page: number;
  @IsNumber()
  total_pages: number;
  @IsNumber()
  total_items: number;
  @IsBoolean()
  has_next: boolean;
  @IsBoolean()
  has_prev: boolean;
  @IsString()
  order_by?: string;
  @IsString()
  sortDirection?: 'ASC' | 'DESC';
}

export class SearchResultDto {
  @IsString()
  status: string;

  @IsNumber()
  code: number;

  @IsArray()
  data: SearchResultItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationMeta)
  meta: PaginationMeta | null;

  @IsString()
  error: string;
}
