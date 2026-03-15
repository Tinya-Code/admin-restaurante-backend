import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

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