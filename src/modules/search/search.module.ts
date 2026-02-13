import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { FirebaseModule } from '../../firebase/firebase.module';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Module({
  imports: [FirebaseModule],
  controllers: [SearchController],
  providers: [SearchService, JwtAuthGuard],
})
export class SearchModule {}
