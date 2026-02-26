import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../database/database.service';
import { RestaurantSettingsResponseDto } from './dto/restaurant-settings-response.dto';
import { UpdateRestaurantSettingsDto } from './dto/update-restaurant-settings.dto';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let databaseService: DatabaseService;

  const mockRestaurantId = '550e8400-e29b-41d4-a716-446655440000';
  const mockNonExistentRestaurantId = '550e8400-e29b-41d4-a716-446655440001';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: DatabaseService,
          useValue: {
            findOne: jest.fn(),
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBusinessSettings', () => {
    it('should return existing business settings', async () => {
      const mockSettings: RestaurantSettingsResponseDto = {
        restaurant_id: mockRestaurantId,
        whatsapp_config: { enabled: true, phone: '+1234567890' },
        display_config: { theme: 'dark', language: 'en' },
        order_config: { autoConfirm: false, preparationTime: 15 },
        business_config: { name: 'Test Restaurant', currency: 'USD' },
        created_at: '2024-02-21T15:06:00.000Z',
        updated_at: '2024-02-21T15:06:00.000Z',
      };

      jest
        .spyOn(databaseService, 'findOne')
        .mockResolvedValue({ id: mockRestaurantId, name: 'Test Restaurant' });
      jest
        .spyOn(databaseService, 'query')
        .mockResolvedValue({ rows: [mockSettings] });

      const result = await service.getBusinessSettings(mockRestaurantId);

      expect(result).toEqual(mockSettings);
      expect(databaseService.findOne).toHaveBeenCalledWith('restaurants', {
        id: mockRestaurantId,
      });
      expect(databaseService.query).toHaveBeenCalledWith(
        'SELECT * FROM restaurant_settings WHERE restaurant_id = $1',
        [mockRestaurantId],
      );
    });

    it('should return default settings when none exist', async () => {
      jest
        .spyOn(databaseService, 'findOne')
        .mockResolvedValue({ id: mockRestaurantId, name: 'Test Restaurant' });
      jest.spyOn(databaseService, 'query').mockResolvedValue({ rows: [] });

      const result = await service.getBusinessSettings(mockRestaurantId);

      expect(result).toEqual({
        restaurant_id: mockRestaurantId,
        whatsapp_config: {},
        display_config: {},
        order_config: {},
        business_config: {},
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    it('should throw NotFoundException when restaurant does not exist', async () => {
      jest.spyOn(databaseService, 'findOne').mockResolvedValue(null);

      await expect(
        service.getBusinessSettings(mockNonExistentRestaurantId),
      ).rejects.toThrow(
        new NotFoundException(
          `No restaurant found with id: ${mockNonExistentRestaurantId}`,
        ),
      );
    });
  });

  describe('updateBusinessSettings', () => {
    it('should update existing business settings', async () => {
      const updateData: UpdateRestaurantSettingsDto = {
        whatsapp_config: { enabled: false },
        business_config: { name: 'Updated Restaurant' },
      };

      const existingSettings = {
        id: 'settings-id',
        restaurant_id: mockRestaurantId,
      };

      const updatedSettings: RestaurantSettingsResponseDto = {
        restaurant_id: mockRestaurantId,
        whatsapp_config: { enabled: false, phone: '+1234567890' },
        display_config: { theme: 'dark', language: 'en' },
        order_config: { autoConfirm: false, preparationTime: 15 },
        business_config: { name: 'Updated Restaurant', currency: 'USD' },
        created_at: '2024-02-21T15:06:00.000Z',
        updated_at: '2024-02-21T16:00:00.000Z',
      };

      jest
        .spyOn(databaseService, 'findOne')
        .mockResolvedValue({ id: mockRestaurantId, name: 'Test Restaurant' });
      jest
        .spyOn(databaseService, 'query')
        .mockResolvedValueOnce({ rows: [existingSettings] })
        .mockResolvedValueOnce({ rows: [updatedSettings] });

      const result = await service.updateBusinessSettings(
        mockRestaurantId,
        updateData,
      );

      expect(result).toEqual(updatedSettings);
      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE restaurant_settings'),
        expect.arrayContaining([
          JSON.stringify(updateData.whatsapp_config),
          JSON.stringify(updateData.business_config),
          expect.any(String), // updated_at
          mockRestaurantId,
        ]),
      );
    });

    it('should create new business settings when none exist', async () => {
      const updateData: UpdateRestaurantSettingsDto = {
        whatsapp_config: { enabled: true },
        display_config: { theme: 'light' },
      };

      const newSettings: RestaurantSettingsResponseDto = {
        restaurant_id: mockRestaurantId,
        whatsapp_config: { enabled: true },
        display_config: { theme: 'light' },
        order_config: {},
        business_config: {},
        created_at: '2024-02-21T16:00:00.000Z',
        updated_at: '2024-02-21T16:00:00.000Z',
      };

      jest
        .spyOn(databaseService, 'findOne')
        .mockResolvedValue({ id: mockRestaurantId, name: 'Test Restaurant' });
      jest
        .spyOn(databaseService, 'query')
        .mockResolvedValueOnce({ rows: [] }) // No existing settings
        .mockResolvedValueOnce({ rows: [newSettings] }); // Insert result

      const result = await service.updateBusinessSettings(
        mockRestaurantId,
        updateData,
      );

      expect(result).toEqual(newSettings);
      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO restaurant_settings'),
        expect.arrayContaining([
          mockRestaurantId,
          JSON.stringify(updateData.whatsapp_config),
          JSON.stringify(updateData.display_config),
          '{}', // default order_config
          '{}', // default business_config
          expect.any(String), // created_at
          expect.any(String), // updated_at
        ]),
      );
    });

    it('should return existing settings when no update data provided', async () => {
      const existingSettings: RestaurantSettingsResponseDto = {
        restaurant_id: mockRestaurantId,
        whatsapp_config: { enabled: true },
        display_config: { theme: 'dark' },
        order_config: { autoConfirm: false },
        business_config: { name: 'Test Restaurant' },
        created_at: '2024-02-21T15:06:00.000Z',
        updated_at: '2024-02-21T15:06:00.000Z',
      };

      jest
        .spyOn(databaseService, 'findOne')
        .mockResolvedValue({ id: mockRestaurantId, name: 'Test Restaurant' });
      jest
        .spyOn(databaseService, 'query')
        .mockResolvedValueOnce({ rows: [{ id: 'settings-id' }] });

      // Mock the getBusinessSettings call that happens when no fields to update
      jest
        .spyOn(service, 'getBusinessSettings')
        .mockResolvedValue(existingSettings);

      const result = await service.updateBusinessSettings(mockRestaurantId, {});

      expect(result).toEqual(existingSettings);
      expect(service.getBusinessSettings).toHaveBeenCalledWith(
        mockRestaurantId,
      );
    });

    it('should throw NotFoundException when restaurant does not exist', async () => {
      const updateData: UpdateRestaurantSettingsDto = {
        whatsapp_config: { enabled: false },
      };

      jest.spyOn(databaseService, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateBusinessSettings(mockNonExistentRestaurantId, updateData),
      ).rejects.toThrow(
        new NotFoundException(
          `No restaurant found with id: ${mockNonExistentRestaurantId}`,
        ),
      );
    });
  });
});
