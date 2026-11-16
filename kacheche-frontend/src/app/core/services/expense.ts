
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Expense,
  ExpenseRequest,
  ExpenseRejectionRequest,
  ExpenseStatus
} from '../../shared/models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8080/api/expenses';

  // Récupérer toutes les dépenses
  getAll(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl);
  }

  // Récupérer une dépense par son identifiant
  getById(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  // Récupérer les dépenses d'un budget
  getByBudget(budgetId: number): Observable<Expense[]> {
    return this.http.get<Expense[]>(
      `${this.apiUrl}/budget/${budgetId}`
    );
  }

  // Récupérer les dépenses selon leur statut
  getByStatus(status: ExpenseStatus): Observable<Expense[]> {
    return this.http.get<Expense[]>(
      `${this.apiUrl}/status/${status}`
    );
  }

  // Créer une dépense
  create(request: ExpenseRequest): Observable<Expense> {
    return this.http.post<Expense>(
      this.apiUrl,
      request
    );
  }

  // Modifier une dépense
  update(
    id: number,
    request: ExpenseRequest
  ): Observable<Expense> {
    return this.http.put<Expense>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  // Approuver une dépense
  approve(id: number): Observable<Expense> {
    return this.http.patch<Expense>(
      `${this.apiUrl}/${id}/approve`,
      {}
    );
  }

  // Rejeter une dépense avec un motif
  reject(
    id: number,
    request: ExpenseRejectionRequest
  ): Observable<Expense> {
    return this.http.patch<Expense>(
      `${this.apiUrl}/${id}/reject`,
      request
    );
  }

  // Supprimer une dépense
  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
