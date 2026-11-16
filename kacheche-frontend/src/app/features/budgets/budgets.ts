
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { BudgetService } from '../../core/services/budget.service';
import { DepartmentService } from '../../core/services/department.service';
import { AuthService } from '../../core/services/auth.service';

import { Budget } from '../../shared/models/budget.model';
import { Department } from '../../shared/models/department.model';

import { BudgetForm } from './budget-form/budget-form';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    CommonModule,
    BudgetForm,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss'
})
export class Budgets implements OnInit {

  budgets: Budget[] = [];

  departments: Department[] = [];

  years: number[] = [];

  displayedColumns: string[] = [
    'id',
    'name',
    'fiscalYear',
    'department',
    'totalAmount',
    'actions'
  ];

  isLoading = false;

  errorMessage = '';
  successMessage = '';

  showForm = false;

  selectedBudget: Budget | null = null;

  selectedYear: number | null = null;
  selectedDepartmentId: number | null = null;

  constructor(
    private budgetService: BudgetService,
    private departmentService: DepartmentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBudgets();
    this.loadFilterData();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadBudgets(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.budgetService.getAll().subscribe({
      next: (budgets) => {
        this.budgets = budgets;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erreur chargement budgets :', error);
        this.errorMessage = 'Impossible de charger les budgets.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadFilterData(): void {
    const currentYear = new Date().getFullYear();

    this.years = Array.from(
      { length: 7 },
      (_, index) => currentYear - 3 + index
    );

    this.departmentService.getAll().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erreur chargement départements :', error);
        this.errorMessage = 'Impossible de charger les départements.';
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Filtrage combiné : année + département
    if (
      this.selectedYear !== null &&
      this.selectedDepartmentId !== null
    ) {
      this.budgetService.getByFiscalYear(this.selectedYear).subscribe({
        next: (budgets) => {
          this.budgets = budgets.filter(
            budget => budget.department.id === this.selectedDepartmentId
          );

          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => this.handleFilterError(error)
      });

      return;
    }

    // Filtrage par année
    if (this.selectedYear !== null) {
      this.budgetService.getByFiscalYear(this.selectedYear).subscribe({
        next: (budgets) => {
          this.budgets = budgets;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => this.handleFilterError(error)
      });

      return;
    }

    // Filtrage par département
    if (this.selectedDepartmentId !== null) {
      this.budgetService.getByDepartment(this.selectedDepartmentId).subscribe({
        next: (budgets) => {
          this.budgets = budgets;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => this.handleFilterError(error)
      });

      return;
    }

    this.loadBudgets();
  }

  private handleFilterError(error: unknown): void {
    console.error('Erreur filtrage budgets :', error);

    this.errorMessage = 'Une erreur est survenue lors du filtrage des budgets.';
    this.isLoading = false;

    this.cdr.markForCheck();
  }

  resetFilters(): void {
    this.selectedYear = null;
    this.selectedDepartmentId = null;

    this.loadBudgets();
  }

  openCreateForm(): void {
    this.selectedBudget = null;
    this.showForm = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditForm(budget: Budget): void {
    this.selectedBudget = budget;
    this.showForm = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedBudget = null;
  }

  onBudgetSaved(): void {
    this.showForm = false;
    this.selectedBudget = null;

    this.successMessage = 'Le budget a été enregistré avec succès.';

    this.loadBudgets();
  }

  deleteBudget(budget: Budget): void {
    if (!this.isAdmin) {
      return;
    }

    const confirmation = confirm(
      `Voulez-vous vraiment supprimer le budget "${budget.name}" ?`
    );

    if (!confirmation) {
      return;
    }

    this.budgetService.delete(budget.id).subscribe({
      next: () => {
        this.successMessage = 'Budget supprimé avec succès.';
        this.errorMessage = '';
        this.applyFilters();
      },
      error: (error) => {
        console.error('Erreur suppression budget :', error);

        this.errorMessage = 'Impossible de supprimer ce budget.';
        this.successMessage = '';

        this.cdr.markForCheck();
      }
    });
  }
}
