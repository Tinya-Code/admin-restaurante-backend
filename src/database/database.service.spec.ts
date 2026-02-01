import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { ConfigService } from '../config/config.service';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: ConfigService,
          useValue: {
            databaseHost: 'localhost',
            databasePort: 5432,
            databaseUser: 'test_user',
            databasePassword: 'test_password',
            databaseName: 'test_db',
          },
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Nota: Los tests de integración requieren una base de datos real
  // Estos son ejemplos de cómo estructurarlos
  describe('query', () => {
    it('should execute a query', async () => {
      // Mock o test de integración real
      expect(service.query).toBeDefined();
    });
  });

  describe('transaction', () => {
    it('should execute a transaction', async () => {
      expect(service.transaction).toBeDefined();
    });
  });
});