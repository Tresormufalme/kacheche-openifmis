
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ExpenseService } from '../../core/services/expense';
import { BudgetService } from '../../core/services/budget.service';
import { AuthService } from '../../core/services/auth.service';

import {
  Expense,
  ExpenseRequest,
  ExpenseStatus
} from '../../shared/models/expense.model';

import { Budget } from '../../shared/models/budget.model';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss'
})
export class Expenses implements OnInit {

  // Données
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  budgets: Budget[] = [];

  // Tableau
  displayedColumns: string[] = [
    'id',
    'description',
    'budget',
    'amount',
    'expenseDate',
    'status',
    'actions'
  ];

  // États de chargement
  isLoading = false;
  isSaving = false;

  // Messages
  errorMessage = '';
  successMessage = '';

  // Formulaire
  showForm = false;
  selectedExpense: Expense | null = null;

  description = '';
  amount: number | null = null;
  expenseDate = new Date().toISOString().split('T')[0];
  selectedBudgetId: number | null = null;

  // Filtre
  selectedStatus: ExpenseStatus | 'ALL' = 'ALL';

  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
    this.loadBudgets();
  }

  // Vérifier le rôle ADMIN
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // Vérifier si l'utilisateur est connecté
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  // Charger toutes les dépenses
  loadExpenses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.expenseService.getAll().subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        this.applyStatusFilter();

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erreur chargement dépenses :', error);

        this.errorMessage =
          'Impossible de charger les dépenses. Vérifiez votre connexion.';

        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Charger les budgets disponibles
  loadBudgets(): void {
    this.budgetService.getAll().subscribe({
      next: (budgets) => {
        this.budgets = budgets;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erreur chargement budgets :', error);

        this.errorMessage =
          'Impossible de charger les budgets disponibles.';

        this.cdr.markForCheck();
      }
    });
  }

  // Filtrer les dépenses par statut
  applyStatusFilter(): void {
    if (this.selectedStatus === 'ALL') {
      this.filteredExpenses = [...this.expenses];
    } else {
      this.filteredExpenses = this.expenses.filter(
        expense => expense.status === this.selectedStatus
      );
    }

    this.cdr.markForCheck();
  }

  // Changement du filtre
  onStatusChange(): void {
    this.applyStatusFilter();
  }

  // Ouvrir le formulaire de création
  openCreateForm(): void {
    this.selectedExpense = null;

    this.description = '';
    this.amount = null;
    this.expenseDate = new Date().toISOString().split('T')[0];
    this.selectedBudgetId = null;

    this.errorMessage = '';
    this.successMessage = '';

    this.showForm = true;
  }

  // Ouvrir le formulaire de modification
  openEditForm(expense: Expense): void {
    this.selectedExpense = expense;

    this.description = expense.description;
    this.amount = expense.amount;
    this.expenseDate = expense.expenseDate;
    this.selectedBudgetId = expense.budgetId;

    this.errorMessage = '';
    this.successMessage = '';

    this.showForm = true;
  }

  // Fermer le formulaire
  closeForm(): void {
    this.showForm = false;
    this.selectedExpense = null;
  }

  // Enregistrer une dépense
  saveExpense(): void {

    if (
      !this.description.trim() ||
      this.amount === null ||
      this.amount <= 0 ||
      !this.expenseDate ||
      this.selectedBudgetId === null
    ) {
      this.errorMessage =
        'Veuillez remplir correctement tous les champs obligatoires.';

      return;
    }

    const request: ExpenseRequest = {
      description: this.description.trim(),
      amount: this.amount,
      expenseDate: this.expenseDate,
      budgetId: this.selectedBudgetId
    };

    this.isSaving = true;
    this.errorMessage = '';

    const operation = this.selectedExpense
      ? this.expenseService.update(this.selectedExpense.id, request)
      : this.expenseService.create(request);

    operation.subscribe({
      next: () => {
  const wasEditing = this.selectedExpense !== null;

  this.isSaving = false;
  this.showForm = false;
  this.selectedExpense = null;

  this.successMessage = wasEditing
    ? 'Dépense modifiée avec succès.'
    : 'Dépense créée avec succès.';

  this.loadExpenses();
  this.cdr.markForCheck();
},
      error: (error) => {
        console.error('Erreur enregistrement dépense :', error);

        this.errorMessage =
          error.error?.message ||
          'Impossible d’enregistrer cette dépense.';

        this.isSaving = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Approuver une dépense
  approveExpense(expense: Expense): void {

    if (!this.isAdmin || expense.status !== 'PENDING') {
      return;
    }

    const confirmation = confirm(
      `Voulez-vous approuver la dépense "${expense.description}" ?`
    );

    if (!confirmation) {
      return;
    }

    this.expenseService.approve(expense.id).subscribe({
      next: () => {
        this.successMessage = 'Dépense approuvée avec succès.';
        this.errorMessage = '';

        this.loadExpenses();
      },
      error: (error) => {
        console.error('Erreur approbation :', error);

        this.errorMessage =
          error.error?.message ||
          'Impossible d’approuver cette dépense.';

        this.cdr.markForCheck();
      }
    });
  }

  // Rejeter une dépense
  rejectExpense(expense: Expense): void {

    if (!this.isAdmin || expense.status !== 'PENDING') {
      return;
    }

    const reason = prompt(
      'Veuillez saisir le motif du rejet :'
    );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      this.errorMessage = 'Le motif du rejet est obligatoire.';
      this.cdr.markForCheck();
      return;
    }

    this.expenseService.reject(expense.id, {
      reason: reason.trim()
    }).subscribe({
      next: () => {
        this.successMessage = 'Dépense rejetée avec succès.';
        this.errorMessage = '';

        this.loadExpenses();
      },
      error: (error) => {
        console.error('Erreur rejet dépense :', error);

        this.errorMessage =
          error.error?.message ||
          'Impossible de rejeter cette dépense.';

        this.cdr.markForCheck();
      }
    });
  }

  // Supprimer une dépense
  deleteExpense(expense: Expense): void {

    if (!this.isAdmin) {
      return;
    }

    const confirmation = confirm(
      `Voulez-vous vraiment supprimer la dépense "${expense.description}" ?`
    );

    if (!confirmation) {
      return;
    }

    this.expenseService.delete(expense.id).subscribe({
      next: () => {
        this.successMessage = 'Dépense supprimée avec succès.';
        this.errorMessage = '';

        this.loadExpenses();
      },
      error: (error) => {
        console.error('Erreur suppression dépense :', error);

        this.errorMessage =
          error.error?.message ||
          'Impossible de supprimer cette dépense.';

        this.cdr.markForCheck();
      }
    });
  }

  // Compter les dépenses par statut
  get pendingCount(): number {
    return this.expenses.filter(
      expense => expense.status === 'PENDING'
    ).length;
  }

  get approvedCount(): number {
    return this.expenses.filter(
      expense => expense.status === 'APPROVED'
    ).length;
  }

  get rejectedCount(): number {
    return this.expenses.filter(
      expense => expense.status === 'REJECTED'
    ).length;
  }

  // Calculer le total des dépenses approuvées
  get totalApprovedAmount(): number {
    return this.expenses
      .filter(expense => expense.status === 'APPROVED')
      .reduce((total, expense) => total + expense.amount, 0);
  }

  // Présentation du statut
  getStatusLabel(status: ExpenseStatus): string {
    const labels: Record<ExpenseStatus, string> = {
      PENDING: 'En attente',
      APPROVED: 'Approuvée',
      REJECTED: 'Rejetée'
    };

    return labels[status];
  }

}
