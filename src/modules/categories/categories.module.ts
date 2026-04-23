import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { FirebaseModule } from '../../firebase/firebase.module';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { CategoriesRepository } from './categories.repository';

@Module({
  imports: [FirebaseModule, DatabaseModule, AuthModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}
