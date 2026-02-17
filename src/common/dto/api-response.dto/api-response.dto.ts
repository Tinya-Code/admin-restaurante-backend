import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../pagination-meta.dto/pagination-meta.dto';

export class ApiResponse<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message?: string;

  data?: T;

  meta?: PaginationMetaDto;

  constructor(data?: T, message?: string, meta?: PaginationMetaDto) {
    this.success = true;
    this.data = data;
    this.message = message;
    this.meta = meta;
  }
}
