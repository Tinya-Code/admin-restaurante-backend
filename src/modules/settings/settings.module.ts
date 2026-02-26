import { Module } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, DatabaseService],
})
export class SettingsModule {}
