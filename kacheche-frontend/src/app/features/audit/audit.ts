
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { AuditService } from '../../core/services/audit.service';
import { BudgetService } from '../../core/services/budget.service';
import { ExpenseService } from '../../core/services/expense';

import {
  BudgetAudit,
  ExpenseAudit
} from '../../shared/models/audit.model';

import { Budget } from '../../shared/models/budget.model';
import { Expense } from '../../shared/models/expense.model';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

type AuditMode = 'budgets' | 'expenses';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './audit.html',
  styleUrl: './audit.scss'
})
export class Audit implements OnInit {

  // Mode d'affichage
  mode: AuditMode = 'budgets';

  // Données disponibles
  budgets: Budget[] = [];
  expenses: Expense[] = [];

  // Historiques
  budgetAuditEntries: BudgetAudit[] = [];
  expenseAuditEntries: ExpenseAudit[] = [];

  // Sélections
  selectedBudgetId: number | null = null;
  selectedExpenseId: number | null = null;

  // Chargement
  isLoadingBudgets = false;
  isLoadingExpenses = false;
  isLoadingHistory = false;

  errorMessage = '';

  // Colonnes du tableau des budgets
  budgetColumns: string[] = [
    'revision',
    'operation',
    'budgetName',
    'amount',
    'username',
    'revisionDate'
  ];

  // Colonnes du tableau des dépenses
  expenseColumns: string[] = [
    'revision',
    'operation',
    'description',
    'amount',
    'status',
    'username',
    'revisionDate'
  ];

  constructor(
    private auditService: AuditService,
    private budgetService: BudgetService,
    private expenseService: ExpenseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBudgets();
    this.loadExpenses();
  }

  // Chargement des budgets
  loadBudgets(): void {
    this.isLoadingBudgets = true;

    this.budgetService.getAll().subscribe({
      next: (budgets) => {
        this.budgets = budgets;
        this.isLoadingBudgets = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erreur chargement budgets :', error);
        this.errorMessage = 'Impossible de charger les budgets.';
        this.isLoadingBudgets = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Chargement des dépenses
  loadExpenses(): void {
    this.isLoadingExpenses = true;

    this.expenseService.getAll().subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        this.isLoadingExpenses = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erreur chargement dépenses :', error);
        this.errorMessage = 'Impossible de charger les dépenses.';
        this.isLoadingExpenses = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Changement de catégorie d'audit
  onModeChange(mode: AuditMode): void {
    this.mode = mode;

    this.selectedBudgetId = null;
    this.selectedExpenseId = null;

    this.budgetAuditEntries = [];
    this.expenseAuditEntries = [];

    this.errorMessage = '';

    this.cdr.markForCheck();
  }

  // Sélection d'un budget
  onBudgetSelected(budgetId: number | null): void {
    this.selectedBudgetId = budgetId;
    this.budgetAuditEntries = [];
    this.errorMessage = '';

    if (budgetId === null) {
      this.cdr.markForCheck();
      return;
    }

    this.loadBudgetHistory(budgetId);
  }

  // Sélection d'une dépense
  onExpenseSelected(expenseId: number | null): void {
    this.selectedExpenseId = expenseId;
    this.expenseAuditEntries = [];
    this.errorMessage = '';

    if (expenseId === null) {
      this.cdr.markForCheck();
      return;
    }

    this.loadExpenseHistory(expenseId);
  }

  // Historique d'un budget
  loadBudgetHistory(budgetId: number): void {
    this.isLoadingHistory = true;
    this.errorMessage = '';

    this.auditService.getBudgetHistory(budgetId).subscribe({
      next: (entries) => {
        this.budgetAuditEntries = entries;
        this.isLoadingHistory = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erreur historique budget :', error);
        this.errorMessage =
          'Impossible de récupérer l’historique de ce budget.';
        this.isLoadingHistory = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Historique d'une dépense
  loadExpenseHistory(expenseId: number): void {
    this.isLoadingHistory = true;
    this.errorMessage = '';

    this.auditService.getExpenseHistory(expenseId).subscribe({
      next: (entries) => {
        this.expenseAuditEntries = entries;
        this.isLoadingHistory = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erreur historique dépense :', error);
        this.errorMessage =
          'Impossible de récupérer l’historique de cette dépense.';
        this.isLoadingHistory = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Actualisation
  refreshHistory(): void {
    this.errorMessage = '';

    if (this.mode === 'budgets') {
      if (this.selectedBudgetId !== null) {
        this.loadBudgetHistory(this.selectedBudgetId);
      } else {
        this.loadBudgets();
      }
    } else {
      if (this.selectedExpenseId !== null) {
        this.loadExpenseHistory(this.selectedExpenseId);
      } else {
        this.loadExpenses();
      }
    }
  }

  // Libellé d'une opération
  getOperationLabel(operation: string): string {
    switch (operation.toUpperCase()) {
      case 'ADD':
      case 'CREATE':
      case 'INSERT':
        return 'Création';

      case 'MOD':
      case 'UPDATE':
        return 'Modification';

      case 'DEL':
      case 'DELETE':
        return 'Suppression';

      default:
        return operation;
    }
  }

  // Classe CSS d'une opération
  getOperationClass(operation: string): string {
    switch (operation.toUpperCase()) {
      case 'ADD':
      case 'CREATE':
      case 'INSERT':
        return 'created';

      case 'MOD':
      case 'UPDATE':
        return 'updated';

      case 'DEL':
      case 'DELETE':
        return 'deleted';

      default:
        return 'unknown';
    }
  }

  // Libellé du statut d'une dépense
  getStatusLabel(status: string | null): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';

      case 'APPROVED':
        return 'Approuvée';

      case 'REJECTED':
        return 'Rejetée';

      default:
        return 'Non disponible';
    }
  }

  // Historique actuellement affiché
  get totalRevisions(): number {
    return this.mode === 'budgets'
      ? this.budgetAuditEntries.length
      : this.expenseAuditEntries.length;
  }

  // Nombre d'utilisateurs concernés
  get totalActors(): number {
    const usernames = this.mode === 'budgets'
      ? this.budgetAuditEntries.map(entry => entry.username)
      : this.expenseAuditEntries.map(entry => entry.username);

    return new Set(usernames.filter(Boolean)).size;
  }

  // Date de la dernière révision
  get latestRevisionDate(): string | null {
    const dates = this.mode === 'budgets'
      ? this.budgetAuditEntries.map(entry => entry.revisionDate)
      : this.expenseAuditEntries.map(entry => entry.revisionDate);

    if (dates.length === 0) {
      return null;
    }

    return dates.reduce((latest, current) =>
      new Date(current).getTime() > new Date(latest).getTime()
        ? current
        : latest
    );
  }

  // Nom de l'élément sélectionné
  get selectedItemName(): string {
    if (this.mode === 'budgets') {
      return this.budgets.find(
        budget => budget.id === this.selectedBudgetId
      )?.name ?? '';
    }

    const expense = this.expenses.find(
      item => item.id === this.selectedExpenseId
    );

    return expense?.description ?? '';
  }
}
