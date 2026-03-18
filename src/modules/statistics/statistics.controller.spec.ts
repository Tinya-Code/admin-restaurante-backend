import { HttpException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let service: StatisticsService;
  let loggerSpy: jest.SpyInstance;

  const mockRestaurantId = '550e8400-e29b-41d4-a716-446655440000';
  const mockInvalidRestaurantId = 'invalid-uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: {
            getProductsCount: jest.fn(),
            getCategoriesCount: jest.fn(),
            getRecentProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
    service = module.get<StatisticsService>(StatisticsService);

    // Mock logger to suppress error messages during tests
    loggerSpy = jest.spyOn(controller['logger'], 'error').mockImplementation();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProductsCount', () => {
    it('should return products count successfully', async () => {
      const expectedResult = {
        restaurant_id: mockRestaurantId,
        total_products: 45,
      };

      jest.spyOn(service, 'getProductsCount').mockResolvedValue(expectedResult);

      const result = await controller.getProductsCount({
        restaurant_id: mockRestaurantId,
      });

      expect(result).toEqual({
        status: 'success',
        code: '200',
        message: 'Products count retrieved successfully',
        data: expectedResult,
      });
      expect(service.getProductsCount).toHaveBeenCalledWith(mockRestaurantId);
    });

    it('should throw NotFoundException when restaurant does not exist', async () => {
      jest
        .spyOn(service, 'getProductsCount')
        .mockRejectedValue(
          new NotFoundException(
            `No restaurant found with id: ${mockRestaurantId}`,
          ),
        );

      await expect(
        controller.getProductsCount({ restaurant_id: mockRestaurantId }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle internal server error', async () => {
      jest
        .spyOn(service, 'getProductsCount')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        controller.getProductsCount({ restaurant_id: mockRestaurantId }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getCategoriesCount', () => {
    it('should return categories count successfully', async () => {
      const expectedResult = {
        restaurant_id: mockRestaurantId,
        total_categories: 12,
      };

      jest
        .spyOn(service, 'getCategoriesCount')
        .mockResolvedValue(expectedResult);

      const result = await controller.getCategoriesCount({
        restaurant_id: mockRestaurantId,
      });

      expect(result).toEqual({
        status: 'success',
        code: '200',
        message: 'Categories count retrieved successfully',
        data: expectedResult,
      });
      expect(service.getCategoriesCount).toHaveBeenCalledWith(mockRestaurantId);
    });

    it('should throw NotFoundException when restaurant does not exist', async () => {
      jest
        .spyOn(service, 'getCategoriesCount')
        .mockRejectedValue(
          new NotFoundException(
            `No restaurant found with id: ${mockRestaurantId}`,
          ),
        );

      await expect(
        controller.getCategoriesCount({ restaurant_id: mockRestaurantId }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle internal server error', async () => {
      jest
        .spyOn(service, 'getCategoriesCount')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        controller.getCategoriesCount({ restaurant_id: mockRestaurantId }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getRecentProducts', () => {
    it('should return recent products with default limit', async () => {
      const expectedResult = {
        restaurant_id: mockRestaurantId,
        products: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Café Americano',
            price: 12.5,
            category_id: '550e8400-e29b-41d4-a716-446655440002',
            created_at: '2024-02-08T22:00:00Z',
          },
        ],
      };

      jest
        .spyOn(service, 'getRecentProducts')
        .mockResolvedValue(expectedResult);

      const result = await controller.getRecentProducts({
        restaurant_id: mockRestaurantId,
      });

      expect(result).toEqual({
        status: 'success',
        code: '200',
        message: 'Recent products retrieved successfully',
        data: expectedResult,
      });
      expect(service.getRecentProducts).toHaveBeenCalledWith(
        mockRestaurantId,
        undefined,
      );
    });

    it('should return recent products with custom limit', async () => {
      const expectedResult = {
        restaurant_id: mockRestaurantId,
        products: [],
      };

      jest
        .spyOn(service, 'getRecentProducts')
        .mockResolvedValue(expectedResult);

      const result = await controller.getRecentProducts({
        restaurant_id: mockRestaurantId,
        limit: 10,
      });

      expect(result).toEqual({
        status: 'success',
        code: '200',
        message: 'Recent products retrieved successfully',
        data: expectedResult,
      });
      expect(service.getRecentProducts).toHaveBeenCalledWith(
        mockRestaurantId,
        10,
      );
    });

    it('should throw NotFoundException when restaurant does not exist', async () => {
      jest
        .spyOn(service, 'getRecentProducts')
        .mockRejectedValue(
          new NotFoundException(
            `No restaurant found with id: ${mockRestaurantId}`,
          ),
        );

      await expect(
        controller.getRecentProducts({ restaurant_id: mockRestaurantId }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle internal server error', async () => {
      jest
        .spyOn(service, 'getRecentProducts')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        controller.getRecentProducts({ restaurant_id: mockRestaurantId }),
      ).rejects.toThrow(HttpException);
    });
  });
});
