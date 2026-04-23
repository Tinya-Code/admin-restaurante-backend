import { ApiProperty } from '@nestjs/swagger';

export interface CategoryTypeMetadata {
  section: number;
  suggestions: string[];
}

export class CategoryTypeResponseDto {
  @ApiProperty({ example: 'uuid-123' })
  id: string;

  @ApiProperty({ example: 'Sección del menú 1' })
  name: string;

  @ApiProperty({
    example: { section: 1, suggestions: ['entradas', 'sopas', 'ensaladas'] },
    description: 'Número de sección del menú y sugerencias de nombres de categoría'
  })
  metadata: CategoryTypeMetadata;
}
