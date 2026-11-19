import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { BudgetService } from '../../../core/services/budget.service';
import { ExpenseService } from '../../../core/services/expense';
import { BaseEntityForm } from '../../../shared/base/base-entity-form';
import { Budget } from '../../../shared/models/budget.model';
import { Expense, ExpenseRequest } from '../../../shared/models/expense.model';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.scss'
})
export class ExpenseForm extends BaseEntityForm<Expense, ExpenseRequest> implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly budgetService = inject(BudgetService);

  protected override readonly service = inject(ExpenseService);

  protected override readonly saveFailed =
    'Impossible d’enregistrer cette dépense.';

  readonly budgets = signal<Budget[]>([]);
  readonly isLoadingBudgets = signal(false);

  // Mêmes règles que ExpenseRequest côté Spring Boot.
  override readonly form = this.fb.nonNullable.group({
    description: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(150)
    ]],
    amount: [0.01, [
      Validators.required,
      Validators.min(0.01)
    ]],
    expenseDate: [this.today(), [Validators.required]],
    budgetId: [0, [
      Validators.required,
      Validators.min(1)
    ]]
  });

  ngOnInit(): void {
    this.loadBudgets();
  }

  private loadBudgets(): void {

    this.isLoadingBudgets.set(true);

    this.budgetService.getAll().subscribe({

      next: (budgets) => {
        this.budgets.set(budgets ?? []);
        this.isLoadingBudgets.set(false);
      },

      error: (error) => {
        console.error('Erreur chargement budgets :', error);
        this.errorMessage.set('Impossible de charger les budgets disponibles.');
        this.isLoadingBudgets.set(false);
      }

    });
  }

  protected override populate(expense: Expense | null): void {
    this.form.reset({
      description: expense?.description ?? '',
      amount: expense?.amount ?? 0.01,
      expenseDate: expense?.expenseDate ?? this.today(),
      budgetId: expense?.budgetId ?? 0
    });
  }

  protected override toRequest(): ExpenseRequest {
    const value = this.form.getRawValue();

    return {
      description: value.description.trim(),
      amount: Number(value.amount),
      expenseDate: value.expenseDate,
      budgetId: Number(value.budgetId)
    };
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }
}
