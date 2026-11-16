
import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Department,
  DepartmentRequest
} from '../../shared/models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8080/api/departments';

  // Récupérer tous les départements
  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl);
  }

  // Récupérer un département par son ID
  getById(id: number): Observable<Department> {
    return this.http.get<Department>(
      `${this.apiUrl}/${id}`
    );
  }

  // Créer un département
  create(request: DepartmentRequest): Observable<Department> {
    return this.http.post<Department>(
      this.apiUrl,
      request
    );
  }

  // Modifier un département
  update(
    id: number,
    request: DepartmentRequest
  ): Observable<Department> {
    return this.http.put<Department>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  // Supprimer un département
  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}
