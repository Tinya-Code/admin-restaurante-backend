import { ApiProperty } from '@nestjs/swagger';

export class TagResponseDto {
  @ApiProperty({ description: 'ID de la etiqueta' })
  id: string;

  @ApiProperty({ description: 'Nombre de la etiqueta', example: 'Vegetariano' })
  name: string;
}
