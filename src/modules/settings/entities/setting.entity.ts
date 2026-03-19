import { ApiProperty } from '@nestjs/swagger';

/**
 * Entidad Setting
 * Representa la configuración de un restaurante en la tabla restaurant_settings
 */
export class Setting {
  @ApiProperty({
    description: 'ID único de la configuración (UUID)',
    example: '9c0b1132-c388-445d-8e47-08afe12a10ce',
  })
  id: string;

  @ApiProperty({
    description: 'ID del restaurante al que pertenece la configuración',
    example: '5a53d32f-834d-43df-a9ed-5db9b6badef9',
  })
  restaurant_id: string;

  @ApiProperty({
    description: 'Configuración de WhatsApp (objeto JSON)',
    example: {
      whatsapp_number: '+1234567890',
    },
    type: 'object',
    additionalProperties: true,
  })
  whatsapp_config: Record<string, any>;

  @ApiProperty({
    description: 'Configuración de visualización (objeto JSON)',
    example: {
      cart_enabled: true,
      is_open: true,
    },
    type: 'object',
    additionalProperties: true,
  })
  display_config: Record<string, any>;

  @ApiProperty({
    description: 'Configuración de pedidos (objeto JSON)',
    example: {},
    type: 'object',
    additionalProperties: true,
  })
  order_config: Record<string, any>;

  @ApiProperty({
    description: 'Configuración del negocio (objeto JSON)',
    example: {
      restaurant_name: 'Mi Restaurante',
      greeting_message: '¡Bienvenido! ¿Qué le gustaría ordenar hoy?',
      whatsapp_cart_template:
        'Hola! Me gustaría ordenar:\n{cart_items}\nTotal: ${total}',
      social_links: {
        facebook: 'https://facebook.com/mirestaurante',
        instagram: 'https://instagram.com/mirestaurante',
      },
      schedule: {
        monday: { opening: '09:00', closing: '22:00', isOpen: true },
        tuesday: { opening: '09:00', closing: '22:00', isOpen: true },
        wednesday: { opening: '09:00', closing: '22:00', isOpen: true },
        thursday: { opening: '09:00', closing: '22:00', isOpen: true },
        friday: { opening: '09:00', closing: '23:00', isOpen: true },
        saturday: { opening: '10:00', closing: '23:00', isOpen: true },
        sunday: { opening: '10:00', closing: '21:00', isOpen: false },
      },
    },
    type: 'object',
    additionalProperties: true,
  })
  business_config: Record<string, any>;

  @ApiProperty({
    description: 'Fecha y hora de creación de la configuración',
    example: '2026-02-21T15:06:00.000Z',
    type: Date,
  })
  created_at: Date;

  @ApiProperty({
    description: 'Fecha y hora de última actualización de la configuración',
    example: '2026-02-21T15:06:00.000Z',
    type: Date,
  })
  updated_at: Date;
}
