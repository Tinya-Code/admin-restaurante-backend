export interface AuthenticatedUser {
  id: string; // UUID interno (ahora requerido tras guard)
  uid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  activeContext: string;
  phone?: string;
  createdAt: Date;
  /** Roles globales de plataforma (super_admin, developer, support). Vacío si ninguno. */
  globalRoles: string[];
}