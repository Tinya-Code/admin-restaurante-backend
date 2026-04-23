import { ApiProperty } from '@nestjs/swagger';

export class ComboProductResponseDto {
  @ApiProperty()
  product_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ required: false })
  image_url?: string;
}

export class ComboResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  branch_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty()
  price: number;

  @ApiProperty({ required: false, nullable: true })
  image_url: string | null;

  @ApiProperty({ required: false, nullable: true })
  cloudinary_id: string | null;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  display_order: number;

  @ApiProperty({ type: [ComboProductResponseDto] })
  products: ComboProductResponseDto[];

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
