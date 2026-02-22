import { HttpException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantSettingsResponseDto } from './dto/restaurant-settings-response.dto';
import { UpdateRestaurantSettingsDto } from './dto/update-restaurant-settings.dto';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

describe('SettingsController', () => {
  let controller: SettingsController;
  let service: SettingsService;
  let loggerSpy: jest.SpyInstance;

  const mockRestaurantId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: {
            getBusinessSettings: jest.fn(),
            updateBusinessSettings: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
    service = module.get<SettingsService>(SettingsService);

    // Mock logger to suppress error messages during tests
    loggerSpy = jest.spyOn(controller['logger'], 'error').mockImplementation();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBusinessSettings', () => {
    it('should return business settings successfully', async () => {
      const expectedResult: RestaurantSettingsResponseDto = {
        restaurant_id: mockRestaurantId,
        whatsapp_config: { enabled: true, phone: '+1234567890' },
        display_config: { theme: 'dark', language: 'en' },
        order_config: { autoConfirm: false, preparationTime: 15 },
        business_config: { name: 'Test Restaurant', currency: 'USD' },
        created_at: '2024-02-21T15:06:00.000Z',
        updated_at: '2024-02-21T15:06:00.000Z',
      };

      jest
        .spyOn(service, 'getBusinessSettings')
        .mockResolvedValue(expectedResult);

      const result = await controller.getBusinessSettings(mockRestaurantId);

      expect(result).toEqual({
        success: true,
        message: 'Business settings retrieved successfully',
        data: expectedResult,
      });
      expect(service.getBusinessSettings).toHaveBeenCalledWith(
        mockRestaurantId,
      );
    });

    it('should throw NotFoundException when restaurant does not exist', async () => {
      jest
        .spyOn(service, 'getBusinessSettings')
        .mockRejectedValue(
          new NotFoundException(
            `No restaurant found with id: ${mockRestaurantId}`,
          ),
        );

      await expect(
        controller.getBusinessSettings(mockRestaurantId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle internal server error', async () => {
      jest
        .spyOn(service, 'getBusinessSettings')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        controller.getBusinessSettings(mockRestaurantId),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('updateBusinessSettings', () => {
    it('should update business settings successfully', async () => {
      const updateData: UpdateRestaurantSettingsDto = {
        whatsapp_config: { enabled: false },
        business_config: { name: 'Updated Restaurant' },
      };

      const expectedResult: RestaurantSettingsResponseDto = {
        restaurant_id: mockRestaurantId,
        whatsapp_config: { enabled: false, phone: '+1234567890' },
        display_config: { theme: 'dark', language: 'en' },
        order_config: { autoConfirm: false, preparationTime: 15 },
        business_config: { name: 'Updated Restaurant', currency: 'USD' },
        created_at: '2024-02-21T15:06:00.000Z',
        updated_at: '2024-02-21T16:00:00.000Z',
      };

      jest
        .spyOn(service, 'updateBusinessSettings')
        .mockResolvedValue(expectedResult);

      const result = await controller.updateBusinessSettings(
        mockRestaurantId,
        updateData,
      );

      expect(result).toEqual({
        success: true,
        message: 'Business settings updated successfully',
        data: expectedResult,
      });
      expect(service.updateBusinessSettings).toHaveBeenCalledWith(
        mockRestaurantId,
        updateData,
      );
    });

    it('should throw NotFoundException when restaurant does not exist', async () => {
      const updateData: UpdateRestaurantSettingsDto = {
        whatsapp_config: { enabled: false },
      };

      jest
        .spyOn(service, 'updateBusinessSettings')
        .mockRejectedValue(
          new NotFoundException(
            `No restaurant found with id: ${mockRestaurantId}`,
          ),
        );

      await expect(
        controller.updateBusinessSettings(mockRestaurantId, updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle internal server error', async () => {
      const updateData: UpdateRestaurantSettingsDto = {
        whatsapp_config: { enabled: false },
      };

      jest
        .spyOn(service, 'updateBusinessSettings')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        controller.updateBusinessSettings(mockRestaurantId, updateData),
      ).rejects.toThrow(HttpException);
    });
  });
});
