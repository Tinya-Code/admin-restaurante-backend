import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { DatabaseModule } from 'src/database/database.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, FirebaseModule, AuthModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
