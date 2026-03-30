import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { DatabaseModule } from 'src/database/database.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [DatabaseModule, FirebaseModule, AuthModule, CloudinaryModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
