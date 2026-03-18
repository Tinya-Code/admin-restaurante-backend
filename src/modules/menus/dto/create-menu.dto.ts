import { IsUUID, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuDto {
  @IsString()

  @IsString()
  @IsNotEmpty()
  name: string;
}
