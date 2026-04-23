import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class UpdateRestaurantTagsDto {
  @ApiProperty({
    description: 'Lista de IDs de etiquetas globales a vincular al restaurante',
    type: [String],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  tag_ids: string[];
}
