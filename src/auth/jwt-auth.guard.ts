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
    const authHeader = request.headers['Authorization'] as string;

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
        // En desarrollo, usar un UUID de prueba existente en la BD
        request.userUuid = '5a53d32f-834d-43df-a9ed-5db9b6badef9';
        return true;
      }
      
      const decodedToken = await this.firebaseService.verifyToken(token);
      // El UID viene del token de Firebase (no del header)
      request.userUuid = decodedToken.uid;
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
