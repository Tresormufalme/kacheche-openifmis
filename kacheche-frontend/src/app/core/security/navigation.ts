// Menu de l'application. Chaque entrée n'est visible que pour les utilisateurs
// possédant la permission indiquée. Pour un nouvel écran : une ligne ici.
export interface NavItem {
  path: string;
  label: string;
  icon: string;
  permission: string;
  section: 'main' | 'control' | 'admin';
}

export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/dashboard', label: 'Tableau de bord', icon: 'dashboard', permission: 'DASHBOARD_READ', section: 'main' },
  { path: '/departments', label: 'Départements', icon: 'business', permission: 'DEPARTMENT_READ', section: 'main' },
  { path: '/budgets', label: 'Budgets', icon: 'account_balance_wallet', permission: 'BUDGET_READ', section: 'main' },
  { path: '/expenses', label: 'Dépenses', icon: 'receipt_long', permission: 'EXPENSE_READ', section: 'main' },
  { path: '/audit', label: 'Audit Trails', icon: 'history', permission: 'AUDIT_READ', section: 'control' },
  { path: '/users', label: 'Utilisateurs', icon: 'group', permission: 'USER_READ', section: 'admin' },
  { path: '/roles', label: 'Rôles et permissions', icon: 'admin_panel_settings', permission: 'ROLE_READ', section: 'admin' }
];
