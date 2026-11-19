import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BudgetService } from '../../core/services/budget.service';
import { DepartmentService } from '../../core/services/department.service';
import { BaseCrudPage, CrudPageText } from '../../shared/base/base-crud-page';
import { AuditButton } from '../../shared/components/audit-button/audit-button';
import { Budget, BudgetRequest } from '../../shared/models/budget.model';
import { Department } from '../../shared/models/department.model';
import { BudgetForm } from './budget-form/budget-form';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    DecimalPipe,
    AuditButton,
    BudgetForm,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss'
})
export class Budgets extends BaseCrudPage<Budget, BudgetRequest> implements OnInit {

  protected override readonly service = inject(BudgetService);
  private readonly departmentService = inject(DepartmentService);

  protected override readonly text: CrudPageText = {
    loadFailed: 'Impossible de charger les budgets.',
    created: 'Le budget a été créé avec succès.',
    updated: 'Le budget a été modifié avec succès.',
    deleted: 'Le budget a été supprimé avec succès.',
    deleteTitle: 'Supprimer le budget',
    deleteFailed:
      'Impossible de supprimer ce budget. Il contient peut-être des dépenses.'
  };

  readonly departments = signal<Department[]>([]);
  readonly selectedYear = signal<number | null>(null);
  readonly selectedDepartmentId = signal<number | null>(null);

  // Années proposées dans le filtre : année courante ± 3.
  readonly years: number[] = Array.from(
    { length: 7 },
    (_, index) => new Date().getFullYear() - 3 + index
  );

  protected override deleteMessage(budget: Budget): string {
    return `Voulez-vous vraiment supprimer le budget « ${budget.name} » ? ` +
      'Cette action est enregistrée dans l’audit trail.';
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadDepartments();
  }

  // Source des données : applique les filtres année / département.
  protected override fetch(): Observable<Budget[]> {

    const year = this.selectedYear();
    const departmentId = this.selectedDepartmentId();

    if (year !== null && departmentId !== null) {
      return this.service.getByFiscalYear(year).pipe(
        map(budgets => budgets.filter(budget => budget.department.id === departmentId))
      );
    }

    if (year !== null) {
      return this.service.getByFiscalYear(year);
    }

    if (departmentId !== null) {
      return this.service.getByDepartment(departmentId);
    }

    return this.service.getAll();
  }

  private loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (departments) => this.departments.set(departments),
      error: (error) => {
        console.error('Erreur chargement départements :', error);
        this.errorMessage.set('Impossible de charger les départements.');
      }
    });
  }

  onYearChange(year: number | null): void {
    this.selectedYear.set(year);
    this.load();
  }

  onDepartmentChange(departmentId: number | null): void {
    this.selectedDepartmentId.set(departmentId);
    this.load();
  }

  resetFilters(): void {
    this.selectedYear.set(null);
    this.selectedDepartmentId.set(null);
    this.load();
  }

  get hasFilters(): boolean {
    return this.selectedYear() !== null || this.selectedDepartmentId() !== null;
  }
}
