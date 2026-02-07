import { ApiErrorDto } from "../api-error.dto/api-error.dto";
import { PaginationMetaDto } from "../pagination-meta.dto/pagination-meta.dto";
export class ApiResponseDto<T> {
  status: 'success' | 'error';
  code: string;
  message: string;
  data?: T;
  meta?: PaginationMetaDto;
  error?: ApiErrorDto;
}