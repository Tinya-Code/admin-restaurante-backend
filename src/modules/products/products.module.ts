import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { DatabaseModule } from '../../database/database.module';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { AuthModule } from '../auth/auth.module';
import { ProductsRepository } from './products.repository';

@Module({
  imports: [
    DatabaseModule,      
    CloudinaryModule,
    FirebaseModule,
    AuthModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService],
})
export class ProductsModule {}
