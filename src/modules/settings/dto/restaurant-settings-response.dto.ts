import { ApiProperty } from '@nestjs/swagger';

/**
 * Respuesta del perfil del restaurante.
 * Datos obtenidos de la tabla `restaurants` + plan activo de `subscriptions/plans`.
 * La tabla `restaurant_settings` fue eliminada del schema; branch_settings
 * es la única fuente de verdad de configuración.
 */
export class RestaurantProfileResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID del restaurante' })
  id: string;

  @ApiProperty({ example: 'Mi Restaurante', description: 'Nombre del restaurante' })
  name: string;

  @ApiProperty({ example: 'mi-restaurante', description: 'Slug único del restaurante' })
  slug: string;

  @ApiProperty({ example: '+51987654321', description: 'Teléfono de contacto', nullable: true })
  phone: string | null;

  @ApiProperty({ example: 'Av. Larco 123, Miraflores', description: 'Dirección del restaurante', nullable: true })
  address: string | null;

  @ApiProperty({ example: true, description: 'Indica si el restaurante está activo' })
  is_active: boolean;

  @ApiProperty({ example: 'Starter', description: 'Nombre del plan activo', nullable: true })
  plan_name: string | null;

  @ApiProperty({ example: 'Plan mensual — 1 sucursal', description: 'Descripción del plan activo', nullable: true })
  plan_description: string | null;

  @ApiProperty({ example: '2026-02-21T15:06:00.000Z', description: 'Fecha de creación' })
  created_at: Date;

  @ApiProperty({ example: '2026-02-21T15:06:00.000Z', description: 'Fecha de última actualización' })
  updated_at: Date;
}
