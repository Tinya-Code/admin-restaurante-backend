export interface AuthenticatedUser {
  id: string; // UUID interno (ahora requerido tras guard)
  uid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  createdAt: Date;
}