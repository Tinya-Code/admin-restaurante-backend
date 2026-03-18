import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [FirebaseModule, DatabaseModule, AuthModule],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}
