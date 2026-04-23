import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { DatabaseModule } from '../../database/database.module';
import { FirebaseModule } from '../../firebase/firebase.module';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
  imports: [DatabaseModule, FirebaseModule, AuthModule, CloudinaryModule],
  controllers: [BannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}
