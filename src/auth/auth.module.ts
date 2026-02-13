import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [FirebaseModule],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
