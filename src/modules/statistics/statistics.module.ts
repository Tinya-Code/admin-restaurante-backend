import { Module } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService, DatabaseService],
})
export class StatisticsModule {}
