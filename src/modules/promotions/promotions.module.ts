import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { DatabaseModule } from '../../database/database.module';
import { FirebaseModule } from '../../firebase/firebase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, FirebaseModule, AuthModule],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
