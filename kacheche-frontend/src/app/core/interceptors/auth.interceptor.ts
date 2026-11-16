import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  let modifiedReq = req;

  // Intercepter les requêtes destinées à notre API backend
  if (req.url.includes(':8080/api/') || req.url.startsWith('/api/')) {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = token;
    }
    modifiedReq = req.clone({
      setHeaders: headers,
      withCredentials: true
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
