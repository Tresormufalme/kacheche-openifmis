
import { Routes } from '@angular/router';

import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Departments } from './features/departments/departments';
import { Budgets } from './features/budgets/budgets';
import { Expenses } from './features/expenses/expenses';
import { Audit } from './features/audit/audit';
import { roleGuard } from './core/guards/role.guard';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },

  {
    path: 'departments',
    component: Departments,
    canActivate: [authGuard]
  },

  {
    path: 'budgets',
    component: Budgets,
    canActivate: [authGuard]
  },

  {
    path: 'expenses',
    component: Expenses,
    canActivate: [authGuard]
  },

  {
  path: 'audit',
  component: Audit,
  canActivate: [authGuard, roleGuard]
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];
