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
export class RestaurantMemberGuard implements CanActivate {
  private readonly logger = new Logger(RestaurantMemberGuard.name);

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

    // ── super_admin bypass ────────────────────────────────────────────────────
    // Un super_admin tiene acceso a todos los restaurantes de la plataforma.
    // Resuelve igualmente el contexto de headers para que los decoradores
    // @CurrentBranch, @CurrentRestaurant, etc. funcionen correctamente,
    // pero omite la verificación de restaurant_members.
    if (user.globalRoles?.includes('super_admin')) {
      this.logger.debug(`super_admin bypass for user ${user.id}`);
      const headerRestaurantId = request.headers['x-restaurant-id'];
      if (headerRestaurantId) {
        request.restaurantId = headerRestaurantId as string;
        request.userRole = 'owner'; // super_admin opera con permisos de owner
      }
      const headerBranchId = request.headers['x-branch-id'];
      if (headerBranchId) request.branchId = headerBranchId as string;
      const headerMenuId = request.headers['x-menu-id'];
      if (headerMenuId) request.menuId = headerMenuId as string;
      return true;
    }

    const headerRestaurantId = request.headers['x-restaurant-id'];
    let restaurantId: string;
    let member: any;

    if (headerRestaurantId) {
      restaurantId = headerRestaurantId as string;
      // Use query to check membership directly
      const result = await this.db.query(
        'SELECT * FROM restaurant_members WHERE user_id = $1 AND restaurant_id = $2 AND is_active = true',
        [user.id, restaurantId],
      );

      if (result.rows.length === 0) {
        this.logger.warn(`User ${user.id} attempted to access restaurant ${restaurantId} without active membership`);
        throw new ForbiddenException('You do not have permission to access this restaurant');
      }
      member = result.rows[0];
    } else {
      // Fetch the first active membership (fallback context)
      const resultMemberships = await this.db.query(
        'SELECT * FROM restaurant_members WHERE user_id = $1 AND is_active = true ORDER BY created_at ASC',
        [user.id],
      );

      if (resultMemberships.rows.length === 0) {
        throw new NotFoundException('No active restaurant memberships found for this user');
      }

      member = resultMemberships.rows[0];
      restaurantId = member.restaurant_id;
    }

    // Attach restaurant context
    request.restaurantId = restaurantId;
    request.userRole = member.role; // owner, admin, staff

    // 2. Resolve branch_id context
    const headerBranchId = request.headers['x-branch-id'];
    let branchId: string;
    let branch: any;

    if (headerBranchId) {
      branchId = headerBranchId as string;
      branch = await this.db.findOne('branches', { 
        id: branchId, 
        restaurant_id: restaurantId,
        is_active: true 
      });

      if (!branch) {
        throw new NotFoundException(`Active branch with ID ${branchId} not found in this restaurant`);
      }
    } else {
      // Default to the main branch
      const branches = await this.db.findAll('branches', { 
        restaurant_id: restaurantId,
        is_main: true,
        is_active: true 
      });

      if (branches.length === 0) {
        // Fallback to any active branch if no main branch exists (shouldn't happen with triggers)
        const anyBranch = await this.db.findAll('branches', { 
          restaurant_id: restaurantId,
          is_active: true 
        });
        
        if (anyBranch.length === 0) {
          throw new NotFoundException('No active branches found for this restaurant');
        }
        branch = anyBranch[0];
      } else {
        branch = branches[0];
      }
      branchId = branch.id;
    }

    request.branchId = branchId;

    // 3. Resolve menu_id context (Menus now belong to branches)
    const headerMenuId = request.headers['x-menu-id'];
    let menuId: string | null = null;
    let menu: any;

    if (headerMenuId) {
      menuId = headerMenuId as string;
      menu = await this.db.findOne('menus', { id: menuId, branch_id: branchId, is_active: true });

      if (!menu) {
        throw new NotFoundException(`Active menu with ID ${menuId} not found in this branch`);
      }
    } else {
      const branchMenus = await this.db.findAll('menus', {
        branch_id: branchId,
        is_active: true
      });

      if (branchMenus.length > 0) {
        // Default to the first active menu found
        menu = branchMenus[0];
        menuId = menu.id;
      }
    }

    request.menuId = menuId;

    return true;
  }
}
