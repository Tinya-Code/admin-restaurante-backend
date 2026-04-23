import { Module } from '@nestjs/common';
import { CategoryTypesController } from './category-types.controller';
import { CategoryTypesService } from './category-types.service';
import { CategoryTypesRepository } from './category-types.repository';
import { DatabaseModule } from '../../database/database.module';
import { FirebaseModule } from '../../firebase/firebase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, FirebaseModule, AuthModule],
  controllers: [CategoryTypesController],
  providers: [CategoryTypesService, CategoryTypesRepository],
  exports: [CategoryTypesService],
})
export class CategoryTypesModule {}
