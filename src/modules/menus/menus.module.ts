import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { MenusRepository } from './menus.repository';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { FirebaseModule } from '../../firebase/firebase.module';

@Module({
  imports: [DatabaseModule, AuthModule, FirebaseModule],
  controllers: [MenusController],
  providers: [MenusService, MenusRepository],
  exports: [MenusService],
})
export class MenusModule {}
