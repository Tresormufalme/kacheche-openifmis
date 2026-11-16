import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, tap } from 'rxjs';

export type UserRole = 'ADMIN' | 'COMPTABLE';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8080/api/departments';

  private authToken: string | null = this.getStoredToken();
  private currentUsername: string | null = this.getStoredUsername();
  private currentRole: UserRole | null = this.getStoredRole();

  private getStoredToken(): string | null {
    try {
      return typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('kacheche_token') : null;
    } catch {
      return null;
    }
  }

  private getStoredUsername(): string | null {
    try {
      return typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('kacheche_username') : null;
    } catch {
      return null;
    }
  }

  private getStoredRole(): UserRole | null {
    try {
      return typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('kacheche_role') as UserRole | null) : null;
    } catch {
      return null;
    }
  }

  login(username: string, password: string): Observable<void> {

    const token = 'Basic ' + btoa(`${username}:${password}`);
    this.authToken = token;

    return this.http.get<unknown[]>(this.apiUrl).pipe(

      tap(() => {
        this.currentUsername = username;
        this.currentRole =
          username === 'admin' ? 'ADMIN' : 'COMPTABLE';
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('kacheche_token', token);
            sessionStorage.setItem('kacheche_username', username);
            sessionStorage.setItem('kacheche_role', this.currentRole);
          }
        } catch {}
      }),

      map((): void => undefined),

      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })

    );
  }

  getToken(): string | null {
    return this.authToken;
  }

  getUsername(): string | null {
    return this.currentUsername;
  }

  getRole(): UserRole | null {
    return this.currentRole;
  }

  isAdmin(): boolean {
    return this.currentRole === 'ADMIN';
  }

  isAuthenticated(): boolean {
    return this.authToken !== null;
  }

  logout(): void {
    this.authToken = null;
    this.currentUsername = null;
    this.currentRole = null;
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('kacheche_token');
        sessionStorage.removeItem('kacheche_username');
        sessionStorage.removeItem('kacheche_role');
      }
    } catch {}
  }
}
