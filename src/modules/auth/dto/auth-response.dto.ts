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

  @ApiProperty()
  createdAt: Date;
}