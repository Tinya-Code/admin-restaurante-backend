import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthUserDto } from './dto/auth-response.dto';
import { UsersRepository } from './users.repository';

interface FirebaseUserData {
  uid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async validateAndGetUser(firebaseUser: FirebaseUserData): Promise<AuthUserDto> {
    this.logger.debug(`Validating user: ${firebaseUser.email} (UID: ${firebaseUser.uid})`);
    
    // 1. Intentar buscar por UID de Firebase
    let user = await this.usersRepository.findByFirebaseUid(firebaseUser.uid);

    // 2. Si no existe por UID, intentar por email (migración o primer login)
    if (!user) {
      this.logger.debug(`User not found by UID, trying email: ${firebaseUser.email}`);
      user = await this.usersRepository.findByEmail(firebaseUser.email);
      
      if (user && !user.firebase_uid) {
        // Enlazamos el UID si se encontró por email pero no tenía UID asociado
        await this.usersRepository.updateFirebaseUid(user.id, firebaseUser.uid);
        this.logger.log(`Linked firebase_uid: ${firebaseUser.uid} to user: ${user.email}`);
      }
    }

    if (!user) {
      this.logger.warn(`Login denied — user not registered: ${firebaseUser.email}`);
      throw new UnauthorizedException(
        'Your account is not registered. Please contact an administrator.',
      );
    }

    this.logger.log(`Login successful: ${user.email}`);

    return {
      id: user.id,
      email: user.email,
      displayName: user.display_name ?? undefined,
      photoUrl: user.photo_url ?? undefined,
      createdAt: user.created_at,
    };
  }
}