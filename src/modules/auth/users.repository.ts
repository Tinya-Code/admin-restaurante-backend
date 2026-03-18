import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface UserRow {
  id: string;
  firebase_uid: string | null;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  created_at: Date;
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
}
