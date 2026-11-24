import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { AuthResponse } from '../../shared/models/auth.model';

const RESPONSE: AuthResponse = {
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  tokenType: 'Bearer',
  expiresIn: 1800,
  user: {
    id: 1,
    username: 'comptable',
    fullName: 'Comptable',
    email: null,
    mustChangePassword: false,
    roles: ['COMPTABLE'],
    permissions: ['EXPENSE_READ', 'EXPENSE_CREATE']
  }
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  it('connecte, garde le jeton et expose les permissions', () => {
    service.login('comptable', 'Secret123').subscribe();

    const req = http.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(RESPONSE);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.getAccessToken()).toBe('access-1');
    expect(service.hasPermission('EXPENSE_CREATE')).toBe(true);
    expect(service.hasPermission('EXPENSE_APPROVE')).toBe(false);
    expect(service.hasAnyPermission(['BUDGET_READ', 'EXPENSE_READ'])).toBe(true);
    expect(service.homeRoute()).toBe('/expenses');
  });

  it('un seul rafraîchissement même si plusieurs requêtes le demandent', () => {
    service.login('comptable', 'Secret123').subscribe();
    http.expectOne('http://localhost:8080/api/auth/login').flush(RESPONSE);

    service.refresh().subscribe();
    service.refresh().subscribe();

    const calls = http.match('http://localhost:8080/api/auth/refresh');
    expect(calls.length).toBe(1);
    expect(calls[0].request.body).toEqual({ refreshToken: 'refresh-1' });

    calls[0].flush({ ...RESPONSE, accessToken: 'access-2', refreshToken: 'refresh-2' });

    expect(service.getAccessToken()).toBe('access-2');
  });

  it('la déconnexion efface la session et révoque le jeton', () => {
    service.login('comptable', 'Secret123').subscribe();
    http.expectOne('http://localhost:8080/api/auth/login').flush(RESPONSE);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);

    const req = http.expectOne('http://localhost:8080/api/auth/logout');
    expect(req.request.body).toEqual({ refreshToken: 'refresh-1' });
    req.flush(null);
  });
});
