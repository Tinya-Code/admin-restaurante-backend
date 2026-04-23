import { Module } from '@nestjs/common';
import { RestaurantTagsService } from './restaurant-tags.service';
import { RestaurantTagsController } from './restaurant-tags.controller';
import { DatabaseModule } from '../../database/database.module';
import { FirebaseModule } from '../../firebase/firebase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, FirebaseModule, AuthModule],
  controllers: [RestaurantTagsController],
  providers: [RestaurantTagsService],
  exports: [RestaurantTagsService],
})
export class RestaurantTagsModule {}
