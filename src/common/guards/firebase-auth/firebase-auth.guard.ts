import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AuthService } from 'src/modules/auth/auth.service';
import type { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      const decoded = await this.firebaseService.verifyIdToken(token);
      this.logger.debug(`Token decoded successfully for email: ${decoded.email}`);

      // Solo permitimos usuarios que iniciaron sesión con Google
      const isGoogleProvider = decoded.firebase?.sign_in_provider === 'google.com';
      if (!isGoogleProvider) {
        this.logger.warn(`Auth failed: provider is ${decoded.firebase?.sign_in_provider}, expected google.com`);
        throw new UnauthorizedException('Only Google sign-in is allowed');
      }

      // Enriquecer el usuario con el ID interno de la base de datos
      const authUser = await this.authService.validateAndGetUser({
        uid: decoded.uid,
        email: decoded.email ?? '',
        displayName: (decoded.name as string) || undefined,
        photoUrl: (decoded.picture as string) || undefined,
      });

      const user: AuthenticatedUser = {
        id: authUser.id,
        uid: decoded.uid,
        email: decoded.email ?? '',
        displayName: decoded.name,
        photoUrl: decoded.picture,
        createdAt: authUser.createdAt,
      };

      request['user'] = user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractBearerToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' && token ? token : null;
  }
}