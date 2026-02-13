import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
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
      await this.firebaseService.verifyToken(token);
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
