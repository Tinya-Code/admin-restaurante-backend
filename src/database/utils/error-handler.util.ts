import {
  DatabaseException,
  UniqueConstraintException,
  ForeignKeyConstraintException,
  QueryExecutionException,
} from '../errors/database.exceptions';

export class DatabaseErrorHandler {
  static handle(error: any, contextMsg: string): never {
    const code = error?.code;
    const detail = error?.detail ? ` - ${error.detail}` : '';

    switch (code) {
      case '23505': // unique_violation
        throw new UniqueConstraintException(`Unique constraint violation: ${contextMsg}${detail}`, error);
      case '23503': // foreign_key_violation
        throw new ForeignKeyConstraintException(`Foreign key violation: ${contextMsg}${detail}`, error);
      case '22P02': // invalid_text_representation
        throw new DatabaseException(`Invalid data format: ${contextMsg}${detail}`, 400, error);
      case '23502': // not_null_violation
        throw new DatabaseException(`Not null constraint violation: ${contextMsg}${detail}`, 400, error);
      default:
        throw new QueryExecutionException(`Database execution error: ${contextMsg}`, error);
    }
  }
}
