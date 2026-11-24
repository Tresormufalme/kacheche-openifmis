import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Autorise la route si l'utilisateur possède AU MOINS UNE des permissions
 * déclarées dans data.permissions :
 *   { path: 'budgets', canActivate: [authGuard, permissionGuard],
 *     data: { permissions: ['BUDGET_READ'] } }
 * Sinon : redirection vers la première page qu'il a le droit de voir.
 */
export const permissionGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const required = (route.data['permissions'] as string[] | undefined) ?? [];

  if (authService.hasAnyPermission(required)) {
    return true;
  }

  const home = authService.homeRoute();

  return router.createUrlTree([home === state.url ? '/forbidden' : home]);
};
