import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import type { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';

@Injectable()
export class RestaurantOwnerGuard implements CanActivate {
  private readonly logger = new Logger(RestaurantOwnerGuard.name);

  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request['user'];

    if (!user) {
      this.logger.error(
        'RestaurantOwnerGuard must be used after FirebaseAuthGuard',
      );
      return false;
    }

    // 1. Resolve restaurant_id STRICTLY
    // Only the x-restaurant-id header is allowed as an explicit override
    const headerRestaurantId = request.headers['x-restaurant-id'];
    let restaurantId: string;
    let restaurant: any;

    if (headerRestaurantId) {
      restaurantId = headerRestaurantId as string;
      restaurant = await this.db.findOne('restaurants', { id: restaurantId });

      if (!restaurant) {
        throw new NotFoundException(
          `Restaurant with ID ${restaurantId} not found`,
        );
      }

      // Verify ownership if explicit ID provided
      if (restaurant.owner_id !== user.id) {
        this.logger.warn(
          `User ${user.id} (UID: ${user.uid}) attempted to access restaurant ${restaurantId} owned by ${restaurant.owner_id}`,
        );
        throw new ForbiddenException(
          'You do not have permission to access this restaurant',
        );
      }
    } else {
      // 2. Fetch the "primary" or first restaurant owned by the user
      const userRestaurants = await this.db.findAll('restaurants', {
        owner_id: user.id,
      });

      if (userRestaurants.length === 0) {
        throw new NotFoundException('No restaurants found for this user');
      }

      // Default to the first one found
      restaurant = userRestaurants[0];
      restaurantId = restaurant.id;
    }

    // 4. Attach to request for use in decorators/controllers
    request.restaurantId = restaurantId;

    return true;
  }
}
