import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

// Connexion obligatoire. Un mot de passe provisoire doit d'abord être changé.
export const authGuard: CanActivateFn = (_route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  if (authService.mustChangePassword() && !state.url.startsWith('/change-password')) {
    return router.createUrlTree(['/change-password']);
  }

  return true;
};

// Page de connexion : inutile si on est déjà connecté.
export const guestGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated()
    ? router.createUrlTree([authService.homeRoute()])
    : true;
};
