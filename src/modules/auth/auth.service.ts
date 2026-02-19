import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { AuthUserDto } from './dto/auth-response.dto';

interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  created_at: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly db: DatabaseService) {}

  async validateAndGetUser(firebaseUser: AuthenticatedUser): Promise<AuthUserDto> {
    const row = await this.db.findOne<UserRow>('users', {
      email: firebaseUser.email.toLowerCase(),
    });

    if (!row) {
      this.logger.warn(`Login denied — user not registered: ${firebaseUser.email}`);
      throw new UnauthorizedException(
        'Your account is not registered. Please contact an administrator.',
      );
    }

    this.logger.log(`Login successful: ${row.email}`);

    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name ?? undefined,
      photoUrl: row.photo_url ?? undefined,
      createdAt: row.created_at,
    };
  }
}