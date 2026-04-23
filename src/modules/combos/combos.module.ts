import { Module } from '@nestjs/common';
import { CombosService } from './combos.service';
import { CombosController } from './combos.controller';
import { DatabaseModule } from '../../database/database.module';
import { FirebaseModule } from '../../firebase/firebase.module';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
  imports: [DatabaseModule, FirebaseModule, AuthModule, CloudinaryModule],
  controllers: [CombosController],
  providers: [CombosService],
  exports: [CombosService],
})
export class CombosModule {}
