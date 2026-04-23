import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth/firebase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { AuthService } from './auth.service';
import { AuthUserDto } from './dto/auth-response.dto';
import { ApiResponse } from '../../common/dto/api-response.dto/api-response.dto';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @UseGuards(FirebaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate Google Firebase token and verify user exists in DB',
  })
  @SwaggerResponse({ status: 200, type: AuthUserDto })
  @ApiUnauthorizedResponse({ description: 'Invalid token or user not registered' })
  async login(@CurrentUser() user: AuthenticatedUser) {
    // El FirebaseAuthGuard ya validó al usuario y lo enriqueció en el request
    const data: AuthUserDto = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      phone: user.phone,
      photoUrl: user.photoUrl,
      activeContext: user.activeContext,
      createdAt: user.createdAt,
      globalRoles: user.globalRoles,
    };

    return new ApiResponse(data, 'Login exitoso');
  }

  @Get('memberships')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Get all restaurants where the user has a role (owner, admin, staff)',
  })
  async getMemberships(@CurrentUser() user: AuthenticatedUser) {
    const memberships = await this.authService.getUserMembershipsWithPlan(user.id);
    return new ApiResponse(memberships, 'Membresías obtenidas correctamente');
  }
}