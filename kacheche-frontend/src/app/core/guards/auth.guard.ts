import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est authentifié.
  if (authService.isAuthenticated()) {
    return true;
  }

  // Sinon, rediriger vers la page de connexion.
  return router.createUrlTree(['/login']);
};
