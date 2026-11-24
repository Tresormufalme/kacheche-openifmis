import { Routes } from '@angular/router';

import { Login } from './features/login/login';
import { ChangePassword } from './features/change-password/change-password';
import { Forbidden } from './features/forbidden/forbidden';
import { Dashboard } from './features/dashboard/dashboard';
import { Departments } from './features/departments/departments';
import { Budgets } from './features/budgets/budgets';
import { Expenses } from './features/expenses/expenses';
import { Audit } from './features/audit/audit';
import { Users } from './features/users/users';
import { Roles } from './features/roles/roles';

import { authGuard, guestGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

// Chaque écran exige une PERMISSION (data.permissions), jamais un nom de rôle.
export const routes: Routes = [

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },

  {
    path: 'change-password',
    component: ChangePassword,
    canActivate: [authGuard]
  },

  {
    path: 'forbidden',
    component: Forbidden,
    canActivate: [authGuard]
  },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['DASHBOARD_READ'] }
  },

  {
    path: 'departments',
    component: Departments,
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['DEPARTMENT_READ'] }
  },

  {
    path: 'budgets',
    component: Budgets,
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['BUDGET_READ'] }
  },

  {
    path: 'expenses',
    component: Expenses,
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['EXPENSE_READ'] }
  },

  {
    path: 'audit',
    component: Audit,
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['AUDIT_READ'] }
  },

  {
    path: 'users',
    component: Users,
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['USER_READ'] }
  },

  {
    path: 'roles',
    component: Roles,
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['ROLE_READ'] }
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];
