import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Permission } from '../../shared/models/role.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private readonly http = inject(HttpClient);

  // Catalogue de toutes les permissions existantes.
  getAll(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${API_URL}/permissions`);
  }
}
