
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  BudgetAudit,
  ExpenseAudit
} from '../../shared/models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  private readonly apiUrl = 'http://localhost:8080/api/audit';

  constructor(private http: HttpClient) {}

  // Historique des budgets
  getBudgetHistory(budgetId: number): Observable<BudgetAudit[]> {
    return this.http.get<BudgetAudit[]>(
      `${this.apiUrl}/budgets/${budgetId}`
    );
  }

  // Historique des dépenses
  getExpenseHistory(expenseId: number): Observable<ExpenseAudit[]> {
    return this.http.get<ExpenseAudit[]>(
      `${this.apiUrl}/expenses/${expenseId}`
    );
  }
}
