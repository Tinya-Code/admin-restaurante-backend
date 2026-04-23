import { ApiProperty } from '@nestjs/swagger';

export class MenuResponseDto {
  @ApiProperty({ example: 'uuid-menu' })
  id: string;

  @ApiProperty({ example: 'uuid-branch' })
  branch_id: string;

  @ApiProperty({ example: 'Menú Principal' })
  name: string;

  @ApiProperty({ example: 'Descripción del menú', required: false })
  description?: string;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: 0 })
  display_order: number;

  @ApiProperty({ example: '2026-03-20T10:00:00Z' })
  created_at: Date;

  @ApiProperty({ example: '2026-03-20T10:00:00Z' })
  updated_at: Date;
}
