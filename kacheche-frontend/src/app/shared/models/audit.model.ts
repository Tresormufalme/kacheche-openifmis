// Réponse unique de GET /api/audit/{entité}/{id}.
// Les champs métier de l'entité (name, amount, status...) sont
// aplatis au même niveau que les champs techniques ci-dessous.
export interface AuditEntry {
  entityId: number;
  revision: number;
  operation: string; // ADD | MOD | DEL (Hibernate Envers)
  revisionDate: string;
  username: string | null;
  [field: string]: unknown;
}

// Clé d'URL de l'entité = nom de sa table : departments, budgets, expenses...
export type AuditEntityKey = string;
