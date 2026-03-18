import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth/firebase-auth.guard';
import { DatabaseModule } from '../../database/database.module';
import { UsersRepository } from './users.repository';

@Module({
  imports: [DatabaseModule, FirebaseModule],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthGuard, UsersRepository],
  exports: [AuthService, FirebaseAuthGuard, UsersRepository],
})
export class AuthModule {}