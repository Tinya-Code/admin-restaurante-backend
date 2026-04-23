import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ example: 'b3e1c2d4-...' })
  id: string;

  @ApiProperty({ example: 'user@gmail.com' })
  email: string;

  @ApiProperty({ example: 'John Doe', required: false })
  displayName?: string;

  @ApiProperty({ example: 'https://...', required: false })
  photoUrl?: string;

  @ApiProperty({ example: 'owner' })
  activeContext: string;

  @ApiProperty({ example: '+51987654321', required: false })
  phone?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    example: ['super_admin'],
    description:
      'Roles globales de plataforma asignados al usuario. Vacío si ninguno.',
    isArray: true,
    type: String,
  })
  globalRoles: string[];
}