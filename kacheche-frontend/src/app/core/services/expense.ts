import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { BaseCrudService } from './base-crud.service';
import {
  Expense,
  ExpenseRequest,
  ExpenseStatus
} from '../../shared/models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService extends BaseCrudService<Expense, ExpenseRequest> {

  constructor() {
    super(`${API_URL}/expenses`);
  }

  getByBudget(budgetId: number): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/budget/${budgetId}`);
  }

  getByStatus(status: ExpenseStatus): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/status/${status}`);
  }

  // Approuver : la version est facultative côté backend, mais on l'envoie
  // pour détecter une modification faite entre-temps par un autre utilisateur.
  approve(expense: Pick<Expense, 'id' | 'version'>): Observable<Expense> {
    return this.http.patch<Expense>(
      `${this.apiUrl}/${expense.id}/approve`,
      {},
      { params: { version: expense.version } }
    );
  }

  reject(
    expense: Pick<Expense, 'id' | 'version'>,
    reason: string
  ): Observable<Expense> {
    return this.http.patch<Expense>(
      `${this.apiUrl}/${expense.id}/reject`,
      { reason, version: expense.version }
    );
  }
}
