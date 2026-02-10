import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({ example: 'NOT_FOUND' })
  code: string;

  @ApiProperty({ example: 'Producto no encontrado' })
  message: string;

  @ApiProperty({ required: false })
  details?: any;

  @ApiProperty({ example: '2026-02-09T10:30:00.000Z', required: false })
  timestamp?: string;

  constructor(code: string, message: string, details?: any) {
    this.code = code;
    this.message = message;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}