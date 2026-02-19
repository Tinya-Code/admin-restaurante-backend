export interface AuthenticatedUser {
  uid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
}