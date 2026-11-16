
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { BudgetService } from '../../../core/services/budget.service';
import { DepartmentService } from '../../../core/services/department.service';

import { Budget, BudgetRequest } from '../../../shared/models/budget.model';
import { Department } from '../../../shared/models/department.model';

@Component({
  selector: 'app-budget-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './budget-form.html',
  styleUrls: ['./budget-form.scss']
})
export class BudgetForm implements OnInit, OnChanges {

  private readonly fb = inject(FormBuilder);
  private readonly budgetService = inject(BudgetService);
  private readonly departmentService = inject(DepartmentService);

  @Input() budget: Budget | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  departments: Department[] = [];

  isSaving = false;
  isLoadingDepartments = false;
  errorMessage = '';

  budgetForm = this.fb.nonNullable.group({
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

    currency: ['USD'],

    departmentId: [0, [
      Validators.required,
      Validators.min(1)
    ]]
  });

  ngOnInit(): void {
    this.loadDepartments();
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['budget']) {
      this.populateForm();
    }
  }

  get isEditMode(): boolean {
    return this.budget !== null;
  }

  loadDepartments(): void {

    this.isLoadingDepartments = true;

    this.departmentService.getAll().subscribe({

      next: (data) => {
        this.departments = data || [];
        this.isLoadingDepartments = false;
      },

      error: (error) => {
        console.error('Erreur chargement départements :', error);
        this.errorMessage = 'Impossible de charger les départements.';
        this.isLoadingDepartments = false;
      }

    });
  }

  populateForm(): void {

    if (this.budget) {

      this.budgetForm.patchValue({
        name: this.budget.name,
        fiscalYear: this.budget.fiscalYear,
        totalAmount: this.budget.totalAmount,
        currency: this.budget.currency,
        departmentId: this.budget.department.id
      });

    } else {

      this.budgetForm.reset({
        name: '',
        fiscalYear: new Date().getFullYear(),
        totalAmount: 0.01,
        currency: 'USD',
        departmentId: 0
      });

    }
  }

  submit(): void {

    if (this.budgetForm.invalid || this.isSaving) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    const values = this.budgetForm.getRawValue();

    const request: BudgetRequest = {
      name: values.name.trim(),
      fiscalYear: values.fiscalYear,
      totalAmount: values.totalAmount,
      currency: values.currency as 'USD' | 'CDF',
      departmentId: values.departmentId
    };

    this.isSaving = true;
    this.errorMessage = '';

    const operation = this.budget
      ? this.budgetService.update(this.budget.id, request)
      : this.budgetService.create(request);

    operation.subscribe({

      next: () => {
        this.isSaving = false;
        this.saved.emit();
      },

      error: (error) => {

        console.error('Erreur sauvegarde budget :', error);

        this.isSaving = false;

        if (error.status === 409) {
          this.errorMessage =
            'Un budget portant ce nom existe déjà pour cette année.';
        } else if (error.status === 404) {
          this.errorMessage =
            'Le département sélectionné est introuvable.';
        } else if (error.status === 403) {
          this.errorMessage =
            'Vous ne disposez pas des permissions nécessaires.';
        } else if (error.status === 400) {
          this.errorMessage =
            error.error?.message || 'Veuillez vérifier les données saisies.';
        } else {
          this.errorMessage =
            'Une erreur est survenue lors de l’enregistrement du budget.';
        }
      }

    });
  }
}
