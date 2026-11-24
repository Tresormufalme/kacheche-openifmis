import { RefSource } from '../../core/services/reference-lookup.service';
import { AuditEntityKey, AuditEntry } from '../models/audit.model';

export type AuditFieldType =
  | 'text'
  | 'code'
  | 'number'
  | 'money'
  | 'date'
  | 'status'
  | 'ref'
  | 'boolean'
  | 'list'       // liste de textes (ex. permissions d'un rôle)
  | 'refList';   // liste d'identifiants résolus en noms (ex. rôles d'un utilisateur)

export interface AuditFieldDef {
  key: string;
  label: string;
  type?: AuditFieldType;
  refSource?: RefSource;   // pour type 'ref' : où chercher le nom
  currencyKey?: string;    // pour type 'money' : champ contenant la devise
}

export interface AuditEntityConfig {
  label: string;     // pluriel : "Budgets"
  singular: string;  // "Budget"
  icon: string;      // icône Material
  readPermission?: string; // permission pour LISTER les éléments (page Audit Trails)
  fields: AuditFieldDef[];
}

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvée',
  REJECTED: 'Rejetée'
};

/**
 * Configuration d'affichage de l'audit, une entrée par entité.
 * Pour une NOUVELLE entité, cette configuration est facultative :
 * sans elle, l'audit affiche automatiquement tous les champs reçus.
 */
export const AUDIT_ENTITIES: Record<AuditEntityKey, AuditEntityConfig> = {

  departments: {
    label: 'Départements',
    singular: 'Département',
    icon: 'business',
    readPermission: 'DEPARTMENT_READ',
    fields: [
      { key: 'name', label: 'Nom' },
      { key: 'code', label: 'Code', type: 'code' },
      { key: 'description', label: 'Description' }
    ]
  },

  budgets: {
    label: 'Budgets',
    singular: 'Budget',
    icon: 'account_balance_wallet',
    readPermission: 'BUDGET_READ',
    fields: [
      { key: 'name', label: 'Nom du budget' },
      { key: 'fiscalYear', label: 'Année fiscale', type: 'number' },
      { key: 'totalAmount', label: 'Montant total', type: 'money', currencyKey: 'currency' },
      { key: 'currency', label: 'Devise' },
      { key: 'departmentId', label: 'Département', type: 'ref', refSource: 'departments' }
    ]
  },

  expenses: {
    label: 'Dépenses',
    singular: 'Dépense',
    icon: 'receipt_long',
    readPermission: 'EXPENSE_READ',
    fields: [
      { key: 'description', label: 'Description' },
      { key: 'amount', label: 'Montant', type: 'money' },
      { key: 'expenseDate', label: 'Date de la dépense', type: 'date' },
      { key: 'status', label: 'Statut', type: 'status' },
      { key: 'rejectionReason', label: 'Motif du rejet' },
      { key: 'budgetId', label: 'Budget', type: 'ref', refSource: 'budgets' }
    ]
  },

  users: {
    label: 'Utilisateurs',
    singular: 'Utilisateur',
    icon: 'group',
    readPermission: 'USER_READ',
    fields: [
      { key: 'username', label: 'Nom d’utilisateur' },
      { key: 'fullName', label: 'Nom complet' },
      { key: 'email', label: 'E-mail' },
      { key: 'enabled', label: 'Compte actif', type: 'boolean' },
      { key: 'mustChangePassword', label: 'Mot de passe provisoire', type: 'boolean' },
      { key: 'roles', label: 'Rôles', type: 'refList', refSource: 'roles' }
    ]
  },

  roles: {
    label: 'Rôles',
    singular: 'Rôle',
    icon: 'admin_panel_settings',
    readPermission: 'ROLE_READ',
    fields: [
      { key: 'name', label: 'Nom du rôle' },
      { key: 'description', label: 'Description' },
      { key: 'systemRole', label: 'Rôle système', type: 'boolean' },
      { key: 'permissions', label: 'Permissions', type: 'list' }
    ]
  }
};

// Champs techniques de la réponse : jamais affichés comme des données.
const META_KEYS = new Set([
  'entityId',
  'revision',
  'operation',
  'revisionDate',
  'username'
]);

function humanize(key: string): string {
  const spaced = key
    .replace(/Id$/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Configuration d'une entité, ou configuration par défaut si elle est inconnue.
export function getAuditConfig(entity: AuditEntityKey): AuditEntityConfig {
  return AUDIT_ENTITIES[entity] ?? {
    label: humanize(entity),
    singular: humanize(entity),
    icon: 'history',
    fields: []
  };
}

// Champs à afficher : ceux de la configuration, sinon déduits des données.
export function resolveAuditFields(
  config: AuditEntityConfig,
  entries: AuditEntry[]
): AuditFieldDef[] {

  if (config.fields.length > 0) {
    return config.fields;
  }

  const keys = new Set<string>();

  for (const entry of entries) {
    for (const key of Object.keys(entry)) {
      if (!META_KEYS.has(key)) {
        keys.add(key);
      }
    }
  }

  return [...keys].map(key => ({ key, label: humanize(key) }));
}
