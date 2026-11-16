
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Budget,
  BudgetRequest
} from '../../shared/models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8080/api/budgets';

  getAll(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.apiUrl);
  }

  getById(id: number): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/${id}`);
  }

  create(request: BudgetRequest): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, request);
  }

  update(id: number, request: BudgetRequest): Observable<Budget> {
    return this.http.put<Budget>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getByFiscalYear(year: number): Observable<Budget[]> {
    return this.http.get<Budget[]>(
      `${this.apiUrl}/year/${year}`
    );
  }

  getByDepartment(departmentId: number): Observable<Budget[]> {
    return this.http.get<Budget[]>(
      `${this.apiUrl}/department/${departmentId}`
    );
  }
}
