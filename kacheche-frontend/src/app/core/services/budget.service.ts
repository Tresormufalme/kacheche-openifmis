import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { BaseCrudService } from './base-crud.service';
import {
  Budget,
  BudgetRequest
} from '../../shared/models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService extends BaseCrudService<Budget, BudgetRequest> {

  constructor() {
    super(`${API_URL}/budgets`);
  }

  getByFiscalYear(year: number): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}/year/${year}`);
  }

  getByDepartment(departmentId: number): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}/department/${departmentId}`);
  }
}
