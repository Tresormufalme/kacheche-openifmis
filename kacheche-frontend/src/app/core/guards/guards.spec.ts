import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter
} from '@angular/router';

import { authGuard } from './auth.guard';
import { permissionGuard } from './permission.guard';
import { AuthService } from '../services/auth.service';
import { AuthResponse } from '../../shared/models/auth.model';

function session(mustChange: boolean, permissions: string[]): AuthResponse {
  return {
    accessToken: 'a', refreshToken: 'r', tokenType: 'Bearer', expiresIn: 1800,
    user: {
      id: 1, username: 'u', fullName: null, email: null,
      mustChangePassword: mustChange, roles: ['X'], permissions
    }
  };
}

describe('guards', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let router: Router;

  const route = (permissions: string[]) =>
    ({ data: { permissions } }) as unknown as ActivatedRouteSnapshot;

  const state = (url: string) => ({ url }) as RouterStateSnapshot;

  const run = (guard: typeof authGuard, r: ActivatedRouteSnapshot, s: RouterStateSnapshot) =>
    TestBed.runInInjectionContext(() => guard(r, s));

  const login = (response: AuthResponse) => {
    auth.login('u', 'p').subscribe();
    http.expectOne('http://localhost:8080/api/auth/login').flush(response);
  };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  it('authGuard : renvoie vers /login si non connecté', () => {
    const result = run(authGuard, route([]), state('/budgets')) as UrlTree;
    expect(router.serializeUrl(result)).toContain('/login');
  });

  it('authGuard : impose le changement de mot de passe provisoire', () => {
    login(session(true, ['BUDGET_READ']));
    const result = run(authGuard, route([]), state('/budgets')) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/change-password');
  });

  it('permissionGuard : autorise avec la permission, redirige sinon', () => {
    login(session(false, ['EXPENSE_READ']));

    expect(run(permissionGuard, route(['EXPENSE_READ']), state('/expenses'))).toBe(true);

    const denied = run(permissionGuard, route(['AUDIT_READ']), state('/audit')) as UrlTree;
    expect(router.serializeUrl(denied)).toBe('/expenses');
  });
});
