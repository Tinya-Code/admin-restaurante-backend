export class User {
  id?: string;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  created_at?: Date;
  updated_at?: Date;
}