import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { FirebaseModule } from './firebase/firebase.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MenusModule } from './modules/menus/menus.module';
import { SettingsModule } from './modules/settings/settings.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { SearchModule } from './modules/search/search.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  
  imports: [ConfigModule, DatabaseModule, FirebaseModule, CloudinaryModule, ProductsModule, CategoriesModule, MenusModule, SettingsModule, StatisticsModule, SearchModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
