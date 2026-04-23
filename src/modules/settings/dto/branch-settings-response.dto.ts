import { ApiProperty } from '@nestjs/swagger';

/**
 * Respuesta de la configuración de una sucursal.
 * Refleja exactamente la tabla branch_settings del schema.
 * branch_settings es la ÚNICA fuente de verdad de configuración;
 * no existe herencia ni fusión con ninguna tabla padre.
 */
export class BranchSettingsResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID único del registro de configuración',
  })
  id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID de la sucursal',
  })
  branch_id: string;

  @ApiProperty({
    example: { number: '+51987654321', message_template: 'Hola, me gustaría ordenar:' },
    description: 'Configuración de WhatsApp',
    type: 'object',
    additionalProperties: true,
  })
  whatsapp_config: Record<string, any>;

  @ApiProperty({
    example: { currency: 'PEN', language: 'es' },
    description: 'Configuración de visualización',
    type: 'object',
    additionalProperties: true,
  })
  display_config: Record<string, any>;

  @ApiProperty({
    example: { enabled: true, delivery_fee: 0, pickup_enabled: true, delivery_enabled: false,
               payment_methods: ['cash', 'yape'], max_order_quantity: 15, accepts_reservations: false },
    description: 'Configuración de pedidos',
    type: 'object',
    additionalProperties: true,
  })
  order_config: Record<string, any>;

  @ApiProperty({
    example: { social_media: { tiktok: '', facebook: '', instagram: '' }, business_hours: {}, delivery_zones: [] },
    description: 'Configuración del negocio',
    type: 'object',
    additionalProperties: true,
  })
  business_config: Record<string, any>;

  @ApiProperty({
    example: { monday: { open: '09:00', close: '22:00', isOpen: true } },
    description: 'Horario operativo específico de la sucursal',
    type: 'object',
    additionalProperties: true,
  })
  schedule: Record<string, any>;

  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/logo.jpg',
    description: 'URL pública del logo de la sucursal',
    nullable: true,
  })
  logo_url: string | null;

  @ApiProperty({
    example: 'branches/v1234/logo_abc',
    description: 'ID del asset del logo en Cloudinary (para gestión interna)',
    nullable: true,
  })
  logo_cloudinary_id: string | null;

  @ApiProperty({
    example: 'Sucursal principal en Miraflores',
    description: 'Descripción de la sucursal',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ example: '2026-02-21T15:06:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2026-02-21T15:06:00.000Z' })
  updated_at: Date;
}
