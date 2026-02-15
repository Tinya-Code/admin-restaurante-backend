import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  userUid?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    // Extraer el token del header "Bearer token"
    const token = this.extractTokenFromHeader(authHeader);
    if (!token) {
      throw new UnauthorizedException('Formato de token inválido');
    }

    try {
      // MODO DESARROLLO: Permitir token de prueba
      if (token === 'test-token-123') {
        console.log('🔓 Modo desarrollo: usando token de prueba');
        request.userUid = 'test-user-123';
        return true;
      }
      
      const decodedToken = await this.firebaseService.verifyToken(token);
      // El UID viene del token de Firebase
      request.userUid = decodedToken.uid;
      console.log('✅ Usuario autenticado:', decodedToken.uid);
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractTokenFromHeader(authHeader: string): string | null {
    const [type, token] = authHeader.split(' ') ?? [];
    return type === 'Bearer' && token ? token : null;
  }
}
