import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO para actualizar el perfil básico del restaurante.
 * Solo permite modificar campos editables de la tabla `restaurants`.
 * La configuración operativa se gestiona en UpdateBranchSettingsDto.
 */
export class UpdateRestaurantProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @ApiPropertyOptional({
    description: 'Nombre del restaurante',
    example: 'Mi Restaurante Actualizado',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @ApiPropertyOptional({
    description: 'Teléfono de contacto del restaurante',
    example: '+51987654321',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional({
    description: 'Dirección del restaurante',
    example: 'Av. Larco 123, Miraflores, Lima',
  })
  address?: string;
}
