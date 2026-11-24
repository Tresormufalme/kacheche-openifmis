import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

// Routes d'authentification : jamais de jeton, jamais de rafraîchissement automatique.
const AUTH_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

function isApiRequest(url: string): boolean {
  return url.includes(':8080/api/') || url.startsWith('/api/');
}

function withToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
}

/**
 * - ajoute "Authorization: Bearer <jeton>" aux appels de l'API ;
 * - sur 401 : rafraîchit le jeton UNE fois et rejoue la requête ;
 *   si le rafraîchissement échoue : retour à l'écran de connexion ;
 * - sur 403 "PASSWORD_CHANGE_REQUIRED" : redirige vers le changement de mot de passe.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  if (!isApiRequest(req.url)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthCall = AUTH_PATHS.some(path => req.url.includes(path));

  const sessionExpired = (): void => {
    authService.clear();
    router.navigate(['/login'], {
      queryParams: { reason: 'expired', returnUrl: router.url }
    });
  };

  const outgoing = isAuthCall ? req : withToken(req, authService.getAccessToken());

  return next(outgoing).pipe(
    catchError((error: unknown) => {

      if (!(error instanceof HttpErrorResponse) || isAuthCall) {
        return throwError(() => error);
      }

      // ---- Jeton expiré : on tente de le rafraîchir une fois ----
      if (error.status === 401) {

        if (!authService.hasRefreshToken()) {
          sessionExpired();
          return throwError(() => error);
        }

        return authService.refresh().pipe(
          switchMap(() => next(withToken(req, authService.getAccessToken()))),
          catchError((retryError: unknown) => {

            // Serveur injoignable : on ne déconnecte pas.
            if (retryError instanceof HttpErrorResponse && retryError.status === 0) {
              return throwError(() => retryError);
            }

            // Rafraîchissement refusé, ou nouveau 401 après rafraîchissement.
            if (!(retryError instanceof HttpErrorResponse)
              || retryError.status === 401
              || retryError.status === 403) {
              sessionExpired();
            }

            return throwError(() => retryError);
          })
        );
      }

      // ---- Mot de passe provisoire à changer ----
      if (error.status === 403
        && (error.error as { code?: string } | null)?.code === 'PASSWORD_CHANGE_REQUIRED') {
        authService.markPasswordChangeRequired();
        router.navigate(['/change-password']);
      }

      return throwError(() => error);
    })
  );
};
