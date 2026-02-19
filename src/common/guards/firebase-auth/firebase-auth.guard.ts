import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseService } from 'src/firebase/firebase.service';
import type { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      const decoded = await this.firebaseService.verifyIdToken(token);

      // Solo permitimos usuarios que iniciaron sesión con Google
      const isGoogleProvider = decoded.firebase?.sign_in_provider === 'google.com';
      if (!isGoogleProvider) {
        throw new UnauthorizedException('Only Google sign-in is allowed');
      }

      const user: AuthenticatedUser = {
        uid: decoded.uid,
        email: decoded.email ?? '',
        displayName: decoded.name,
        photoUrl: decoded.picture,
      };

      request['user'] = user;
      return true;
    } catch (error) {
      this.logger.warn(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractBearerToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' && token ? token : null;
  }
}