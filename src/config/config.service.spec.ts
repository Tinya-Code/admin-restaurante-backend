import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let nestConfigService: NestConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: NestConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                DB_HOST: 'localhost',
                DB_PORT: '5432',
                DB_USER: 'test_user',
                DB_PASSWORD: 'test_password',
                DB_NAME: 'test_db',
                FIREBASE_PROJECT_ID: 'test-project',
                FIREBASE_CLIENT_EMAIL: 'test@test.com',
                FIREBASE_PRIVATE_KEY: 'test-key',
                CLOUDINARY_CLOUD_NAME: 'test-cloud',
                CLOUDINARY_API_KEY: 'test-key',
                CLOUDINARY_API_SECRET: 'test-secret',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
    nestConfigService = module.get<NestConfigService>(NestConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Database Configuration', () => {
    it('should return database host', () => {
      expect(service.databaseHost).toBe('localhost');
    });

    it('should return database port as number', () => {
      expect(service.databasePort).toBe(5432);
    });

    it('should return database user', () => {
      expect(service.databaseUser).toBe('test_user');
    });

    it('should return database password', () => {
      expect(service.databasePassword).toBe('test_password');
    });

    it('should return database name', () => {
      expect(service.databaseName).toBe('test_db');
    });
  });

  describe('Firebase Configuration', () => {
    it('should return firebase project id', () => {
      expect(service.firebaseProjectId).toBe('test-project');
    });

    it('should return firebase client email', () => {
      expect(service.firebaseClientEmail).toBe('test@test.com');
    });

    it('should return firebase private key', () => {
      expect(service.firebasePrivateKey).toBe('test-key');
    });
  });

  describe('Cloudinary Configuration', () => {
    it('should return cloudinary cloud name', () => {
      expect(service.cloudinaryCloudName).toBe('test-cloud');
    });

    it('should return cloudinary api key', () => {
      expect(service.cloudinaryApiKey).toBe('test-key');
    });

    it('should return cloudinary api secret', () => {
      expect(service.cloudinaryApiSecret).toBe('test-secret');
    });
  });
});