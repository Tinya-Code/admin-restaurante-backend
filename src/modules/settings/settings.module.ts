import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { DatabaseModule } from 'src/database/database.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, FirebaseModule, AuthModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
