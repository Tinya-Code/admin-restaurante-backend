import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface UserRow {
  id: string;
  firebase_uid: string | null;
  email: string;
  phone: string | null;
  display_name: string | null;
  active_context: 'owner' | 'visitor';
  is_active: boolean;
  created_at: Date;
}

export interface UserMembership {
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  role: 'owner' | 'admin' | 'staff';
}

export interface UserMembershipExtended extends UserMembership {
  restaurantIsActive: boolean;
  planName: string | null;
  subscriptionStatus: 'active' | 'cancelled' | 'expired' | null;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly db: DatabaseService) {}

  async findByFirebaseUid(uid: string): Promise<UserRow | null> {
    return this.db.findOne<UserRow>('users', { firebase_uid: uid });
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    return this.db.findOne<UserRow>('users', { email: email.toLowerCase() });
  }

  async updateFirebaseUid(id: string, uid: string): Promise<void> {
    await this.db.update('users', id, { firebase_uid: uid });
  }

  async findById(id: string): Promise<UserRow | null> {
    return this.db.findOne<UserRow>('users', { id });
  }

  async findUserMemberships(userId: string): Promise<UserMembership[]> {
    const query = `
      SELECT 
        rm.restaurant_id as "restaurantId", 
        rm.role, 
        r.name as "restaurantName", 
        r.slug as "restaurantSlug"
      FROM restaurant_members rm
      JOIN restaurants r ON rm.restaurant_id = r.id
      WHERE rm.user_id = $1 AND rm.is_active = true
    `;
    const result = await this.db.query<UserMembership>(query, [userId]);
    return result.rows;
  }

  /**
   * Retorna los nombres de los roles globales de plataforma del usuario.
   * Usa el índice idx_user_global_roles_user (02_indexes.sql).
   * Retorna [] si el usuario no tiene ningún rol global asignado.
   */
  async findGlobalRoles(userId: string): Promise<string[]> {
    const query = `
      SELECT gr.name
      FROM user_global_roles ugr
      JOIN global_roles gr ON gr.id = ugr.role_id
      WHERE ugr.user_id = $1
    `;
    const result = await this.db.query<{ name: string }>(query, [userId]);
    return result.rows.map((r) => r.name);
  }

  /**
   * Membresías con contexto de plan y suscripción activa.
   * Sirve para que el frontend muestre alertas de plan expirado o restaurante inactivo.
   */
  async findUserMembershipsWithPlan(
    userId: string,
  ): Promise<UserMembershipExtended[]> {
    const query = `
      SELECT
        rm.restaurant_id    AS "restaurantId",
        rm.role,
        r.name              AS "restaurantName",
        r.slug              AS "restaurantSlug",
        r.is_active         AS "restaurantIsActive",
        p.name              AS "planName",
        s.status            AS "subscriptionStatus"
      FROM restaurant_members rm
      JOIN restaurants r ON rm.restaurant_id = r.id
      LEFT JOIN plans p ON p.id = r.plan_id
      LEFT JOIN subscriptions s
        ON s.restaurant_id = r.id AND s.status = 'active'
      WHERE rm.user_id = $1 AND rm.is_active = true
    `;
    const result = await this.db.query<UserMembershipExtended>(query, [userId]);
    return result.rows;
  }
}
