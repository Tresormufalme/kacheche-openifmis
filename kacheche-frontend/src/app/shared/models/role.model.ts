import { Versioned } from './base.model';

export interface Role extends Versioned {
  name: string;
  description: string | null;
  systemRole: boolean;
  permissions: string[];
}

export interface RoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

// Entrée du catalogue renvoyé par GET /api/permissions
export interface Permission {
  code: string;
  group: string;
  description: string;
}
