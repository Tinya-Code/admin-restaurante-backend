import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  userUuid?: string;  // Solo UUID de PostgreSQL (viene del header)
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers['authorization'];
    const userUuidHeader = request.headers['x-user-uuid'];

    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    if (!userUuidHeader) {
      throw new UnauthorizedException('UUID de usuario no proporcionado en header x-user-uuid');
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
        request.userUuid = userUuidHeader as string;
        return true;
      }
      
      const decodedToken = await this.firebaseService.verifyToken(token);
      // El UUID viene del header (PostgreSQL) - el de Firebase no lo usamos para buscar
      request.userUuid = userUuidHeader as string;
      console.log('✅ Usuario autenticado:', decodedToken.uid);
      console.log('🆔 UUID PostgreSQL:', request.userUuid);
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
