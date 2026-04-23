import { HttpException, HttpStatus } from '@nestjs/common';

export class DatabaseException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly originalError?: any,
  ) {
    super({ message, error: 'Database Error', statusCode: status }, status);
  }
}

export class UniqueConstraintException extends DatabaseException {
  constructor(message: string, originalError?: any) {
    super(message, HttpStatus.CONFLICT, originalError);
  }
}

export class ForeignKeyConstraintException extends DatabaseException {
  constructor(message: string, originalError?: any) {
    super(message, HttpStatus.BAD_REQUEST, originalError);
  }
}

export class QueryExecutionException extends DatabaseException {
  constructor(message: string, originalError?: any) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, originalError);
  }
}

export class ConnectionException extends DatabaseException {
  constructor(message: string, originalError?: any) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, originalError);
  }
}
