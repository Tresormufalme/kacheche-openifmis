import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { BudgetService } from '../../../core/services/budget.service';
import { DepartmentService } from '../../../core/services/department.service';
import { BaseEntityForm } from '../../../shared/base/base-entity-form';
import {
  Budget,
  BudgetRequest,
  Currency
} from '../../../shared/models/budget.model';
import { Department } from '../../../shared/models/department.model';

@Component({
  selector: 'app-budget-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './budget-form.html',
  styleUrl: './budget-form.scss'
})
export class BudgetForm extends BaseEntityForm<Budget, BudgetRequest> implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);

  protected override readonly service = inject(BudgetService);

  protected override readonly saveFailed =
    'Une erreur est survenue lors de l’enregistrement du budget.';

  readonly departments = signal<Department[]>([]);
  readonly isLoadingDepartments = signal(false);

  // Mêmes règles que BudgetRequest côté Spring Boot.
  override readonly form = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(150)
    ]],
    fiscalYear: [new Date().getFullYear(), [
      Validators.required,
      Validators.min(2000),
      Validators.max(2100)
    ]],
    totalAmount: [0.01, [
      Validators.required,
      Validators.min(0.01)
    ]],
    currency: ['USD' as Currency, [Validators.required]],
    departmentId: [0, [
      Validators.required,
      Validators.min(1)
    ]]
  });

  ngOnInit(): void {
    this.loadDepartments();
  }

  private loadDepartments(): void {

    this.isLoadingDepartments.set(true);

    this.departmentService.getAll().subscribe({

      next: (departments) => {
        this.departments.set(departments ?? []);
        this.isLoadingDepartments.set(false);
      },

      error: (error) => {
        console.error('Erreur chargement départements :', error);
        this.errorMessage.set('Impossible de charger les départements.');
        this.isLoadingDepartments.set(false);
      }

    });
  }

  protected override populate(budget: Budget | null): void {
    this.form.reset({
      name: budget?.name ?? '',
      fiscalYear: budget?.fiscalYear ?? new Date().getFullYear(),
      totalAmount: budget?.totalAmount ?? 0.01,
      currency: budget?.currency ?? 'USD',
      departmentId: budget?.department.id ?? 0
    });
  }

  protected override toRequest(): BudgetRequest {
    const value = this.form.getRawValue();

    return {
      name: value.name.trim(),
      fiscalYear: Number(value.fiscalYear),
      totalAmount: Number(value.totalAmount),
      currency: value.currency,
      departmentId: Number(value.departmentId)
    };
  }
}
