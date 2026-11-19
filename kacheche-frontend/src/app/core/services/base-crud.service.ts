import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Versioned } from '../../shared/models/base.model';

/**
 * CRUD HTTP générique, miroir de BaseController côté Spring Boot.
 * T = ressource renvoyée, R = corps de la requête.
 */
export abstract class BaseCrudService<T extends Versioned, R extends object> {

  protected readonly http = inject(HttpClient);

  protected constructor(protected readonly apiUrl: string) {}

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.apiUrl);
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${id}`);
  }

  create(request: R): Observable<T> {
    return this.http.post<T>(this.apiUrl, request);
  }

  // Optimistic locking : on renvoie la version lue par l'utilisateur.
  // Si quelqu'un a modifié l'élément entre-temps, le backend répond 409.
  update(current: Pick<T, 'id' | 'version'>, request: R): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${current.id}`, {
      ...request,
      version: current.version
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
