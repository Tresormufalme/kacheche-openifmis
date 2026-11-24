import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { AuthResponse } from '../../shared/models/auth.model';

const SESSION: AuthResponse = {
  accessToken: 'old-access',
  refreshToken: 'refresh-1',
  tokenType: 'Bearer',
  expiresIn: 1800,
  user: {
    id: 1, username: 'admin', fullName: null, email: null,
    mustChangePassword: false, roles: ['ADMIN'], permissions: ['DEPARTMENT_READ']
  }
};

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    auth.login('admin', 'x').subscribe();
    controller.expectOne('http://localhost:8080/api/auth/login').flush(SESSION);
  });

  it('ajoute le jeton Bearer aux appels API', () => {
    http.get('http://localhost:8080/api/departments').subscribe();

    const req = controller.expectOne('http://localhost:8080/api/departments');
    expect(req.request.headers.get('Authorization')).toBe('Bearer old-access');
    req.flush([]);
  });

  it('rafraîchit le jeton sur 401 puis rejoue la requête', () => {
    let result: unknown;

    http.get('http://localhost:8080/api/departments').subscribe(r => (result = r));

    controller.expectOne('http://localhost:8080/api/departments')
      .flush({ code: 'TOKEN_EXPIRED' }, { status: 401, statusText: 'Unauthorized' });

    controller.expectOne('http://localhost:8080/api/auth/refresh')
      .flush({ ...SESSION, accessToken: 'new-access', refreshToken: 'refresh-2' });

    const retry = controller.expectOne('http://localhost:8080/api/departments');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer new-access');
    retry.flush(['ok']);

    expect(result).toEqual(['ok']);
  });

  it('retourne à la connexion si le rafraîchissement est refusé', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    let failed = false;

    http.get('http://localhost:8080/api/departments')
      .subscribe({ error: () => (failed = true) });

    controller.expectOne('http://localhost:8080/api/departments')
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    controller.expectOne('http://localhost:8080/api/auth/refresh')
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(failed).toBe(true);
    expect(auth.isAuthenticated()).toBe(false);
    expect(navigate).toHaveBeenCalled();
  });
});
