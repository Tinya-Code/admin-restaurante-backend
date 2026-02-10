import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class ReorderProductItemDto {
  @IsUUID()
  @ApiProperty({
    description: 'ID del producto',
    example: '9c0b1132-c388-445d-8e47-08afe12a10ce',
  })
  id: string;

  @IsInt()
  @Min(0)
  @ApiProperty({
    description: 'Nuevo orden de visualización',
    example: 5,
    minimum: 0,
  })
  display_order: number;
}

export class ReorderProductsDto {
  @ApiProperty({
    description: 'Lista de productos con su nuevo orden',
    type: [ReorderProductItemDto],
  })
  updates: ReorderProductItemDto[];
}