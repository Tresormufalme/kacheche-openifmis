import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  catchError,
  finalize,
  map,
  of,
  shareReplay,
  tap,
  throwError
} from 'rxjs';

import { API_URL } from '../config/api.config';
import { NAV_ITEMS } from '../security/navigation';
import {
  AuthResponse,
  CurrentUser
} from '../../shared/models/auth.model';

const STORAGE_KEY = 'kacheche_session';

// Anciennes clés de l'authentification Basic : on les supprime.
const LEGACY_KEYS = ['kacheche_token', 'kacheche_username', 'kacheche_role'];

interface Session {
  accessToken: string;
  refreshToken: string;
  user: CurrentUser;
}

function readSession(): Session | null {
  try {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }

    LEGACY_KEYS.forEach(key => sessionStorage.removeItem(key));

    const raw = sessionStorage.getItem(STORAGE_KEY);

    return raw ? (JSON.parse(raw) as Session) : null;

  } catch {
    return null;
  }
}

function writeSession(session: Session | null): void {
  try {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    if (session) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // stockage indisponible : la session reste en mémoire
  }
}

/**
 * Session utilisateur : connexion JWT, rafraîchissement automatique du jeton,
 * rôles et permissions. L'interface se base sur les PERMISSIONS (hasPermission),
 * jamais sur un nom de rôle ou de compte.
 * Les jetons sont gardés en sessionStorage : la session se ferme avec l'onglet.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly session = signal<Session | null>(readSession());

  // Un seul rafraîchissement à la fois, même si plusieurs requêtes expirent ensemble.
  private refreshInFlight$: Observable<AuthResponse> | null = null;

  readonly user = computed(() => this.session()?.user ?? null);

  // ---------- ÉTAT ----------

  isAuthenticated(): boolean {
    return this.session() !== null;
  }

  getAccessToken(): string | null {
    return this.session()?.accessToken ?? null;
  }

  hasRefreshToken(): boolean {
    return !!this.session()?.refreshToken;
  }

  mustChangePassword(): boolean {
    return this.user()?.mustChangePassword ?? false;
  }

  hasPermission(code: string): boolean {
    return this.user()?.permissions.includes(code) ?? false;
  }

  // Vrai si l'utilisateur possède AU MOINS UNE des permissions.
  hasAnyPermission(codes: readonly string[]): boolean {
    return codes.length === 0 || codes.some(code => this.hasPermission(code));
  }

  hasRole(name: string): boolean {
    return this.user()?.roles.includes(name) ?? false;
  }

  displayName(): string {
    const user = this.user();

    return user ? (user.fullName || user.username) : '';
  }

  rolesLabel(): string {
    return this.user()?.roles.join(', ') ?? '';
  }

  // Première page autorisée pour cet utilisateur (page d'accueil).
  homeRoute(): string {
    const item = NAV_ITEMS.find(entry => this.hasPermission(entry.permission));

    return item ? item.path : '/forbidden';
  }

  // ---------- ACTIONS ----------

  login(username: string, password: string): Observable<CurrentUser> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, { username, password })
      .pipe(
        tap(response => this.store(response)),
        map(response => response.user)
      );
  }

  refresh(): Observable<AuthResponse> {

    const refreshToken = this.session()?.refreshToken;

    if (!refreshToken) {
      return throwError(() => new Error('NO_REFRESH_TOKEN'));
    }

    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = this.http
        .post<AuthResponse>(`${API_URL}/auth/refresh`, { refreshToken })
        .pipe(
          tap(response => this.store(response)),
          finalize(() => { this.refreshInFlight$ = null; }),
          shareReplay(1)
        );
    }

    return this.refreshInFlight$;
  }

  // Au démarrage : relit les droits actuels de l'utilisateur depuis le serveur.
  restoreSession(): Observable<void> {

    if (!this.isAuthenticated()) {
      return of(undefined);
    }

    return this.http.get<CurrentUser>(`${API_URL}/auth/me`).pipe(
      tap(user => this.updateUser(user)),
      map((): void => undefined),
      // Serveur injoignable : on garde la session, on réessaiera plus tard.
      catchError(() => of(undefined))
    );
  }

  // Recharge rôles et permissions (ex. après modification de ses propres droits).
  reloadUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${API_URL}/auth/me`).pipe(
      tap(user => this.updateUser(user))
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<CurrentUser> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      })
      .pipe(
        tap(response => this.store(response)),
        map(response => response.user)
      );
  }

  // Le backend exige un changement de mot de passe (réponse 403 dédiée).
  markPasswordChangeRequired(): void {
    this.session.update(session =>
      session
        ? { ...session, user: { ...session.user, mustChangePassword: true } }
        : session
    );

    writeSession(this.session());
  }

  logout(): void {

    const refreshToken = this.session()?.refreshToken;

    this.clear();

    if (refreshToken) {
      // Révoque la session côté serveur ; échec sans conséquence.
      this.http
        .post(`${API_URL}/auth/logout`, { refreshToken })
        .subscribe({ error: () => undefined });
    }
  }

  // Efface la session locale (déconnexion ou session expirée).
  clear(): void {
    this.session.set(null);
    writeSession(null);
  }

  // ---------- PRIVÉ ----------

  private store(response: AuthResponse): void {
    const session: Session = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user
    };

    this.session.set(session);
    writeSession(session);
  }

  private updateUser(user: CurrentUser): void {
    this.session.update(session => (session ? { ...session, user } : session));
    writeSession(this.session());
  }
}
