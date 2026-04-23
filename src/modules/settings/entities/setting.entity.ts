import { ApiProperty } from '@nestjs/swagger';

/**
 * Entidad BranchSettings
 * Refleja exactamente la tabla branch_settings del schema SaaS.
 * branch_settings es la ÚNICA fuente de verdad de configuración;
 * no existe herencia con restaurant_settings (tabla eliminada del schema).
 */
export class BranchSettings {
  @ApiProperty({ description: 'ID único del registro' })
  id: string;

  @ApiProperty({ description: 'ID de la sucursal (FK a branches.id)' })
  branch_id: string;

  @ApiProperty({ description: 'Configuración de WhatsApp', type: 'object', additionalProperties: true })
  whatsapp_config: Record<string, any>;

  @ApiProperty({ description: 'Configuración de visualización', type: 'object', additionalProperties: true })
  display_config: Record<string, any>;

  @ApiProperty({ description: 'Configuración de pedidos', type: 'object', additionalProperties: true })
  order_config: Record<string, any>;

  @ApiProperty({ description: 'Configuración del negocio (redes sociales, horarios, zonas de delivery)', type: 'object', additionalProperties: true })
  business_config: Record<string, any>;

  @ApiProperty({ description: 'URL pública del logo', nullable: true })
  logo_url: string | null;

  @ApiProperty({ description: 'ID del asset del logo en Cloudinary', nullable: true })
  logo_cloudinary_id: string | null;

  @ApiProperty({ description: 'Descripción de la sucursal', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Horario operativo de la sucursal', type: 'object', additionalProperties: true })
  schedule: Record<string, any>;

  @ApiProperty({ type: Date })
  created_at: Date;

  @ApiProperty({ type: Date })
  updated_at: Date;
}
