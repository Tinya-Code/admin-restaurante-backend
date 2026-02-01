import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  // Database Configuration
  get databaseHost(): string {
    return this.configService.get<string>('DB_HOST', 'localhost');
  }

  get databasePort(): number {
    return parseInt(this.configService.get<string>('DB_PORT', '5432'), 10);
  }

  get databaseUser(): string {
    return this.configService.get<string>('DB_USER', 'postgres');
  }

  get databasePassword(): string {
    return this.configService.get<string>('DB_PASSWORD', 'postgres');
  }

  get databaseName(): string {
    return this.configService.get<string>('DB_NAME', 'app_db');
  }

  // Firebase Configuration
  get firebaseProjectId(): string {
    return this.configService.get<string>('FIREBASE_PROJECT_ID', '');
  }

  get firebaseClientEmail(): string {
    return this.configService.get<string>('FIREBASE_CLIENT_EMAIL', '');
  }

  get firebasePrivateKey(): string {
    return this.configService.get<string>('FIREBASE_PRIVATE_KEY', '').replace(/\\n/g, '\n');
  }

  // Cloudinary Configuration
  get cloudinaryCloudName(): string {
    return this.configService.get<string>('CLOUDINARY_CLOUD_NAME', '');
  }

  get cloudinaryApiKey(): string {
    return this.configService.get<string>('CLOUDINARY_API_KEY', '');
  }

  get cloudinaryApiSecret(): string {
    return this.configService.get<string>('CLOUDINARY_API_SECRET', '');
  }
}
