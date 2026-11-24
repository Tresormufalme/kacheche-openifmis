import { Versioned } from './base.model';

export interface RoleSummary {
  id: number;
  name: string;
}

// Compte géré depuis l'écran Utilisateurs (≠ CurrentUser = session en cours).
export interface AppUser extends Versioned {
  username: string;
  fullName: string | null;
  email: string | null;
  enabled: boolean;
  locked: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  roles: RoleSummary[];
}

export interface UserRequest {
  username: string;
  fullName: string;
  email: string;
  password: string | null; // obligatoire à la création, ignoré à la modification
  roleIds: number[];
  enabled: boolean;
}
