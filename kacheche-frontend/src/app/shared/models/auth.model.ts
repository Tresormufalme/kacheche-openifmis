// Utilisateur connecté, tel que renvoyé par /api/auth/login et /api/auth/me.
export interface CurrentUser {
  id: number;
  username: string;
  fullName: string | null;
  email: string | null;
  mustChangePassword: boolean;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number; // durée de vie du jeton d'accès, en secondes
  user: CurrentUser;
}
