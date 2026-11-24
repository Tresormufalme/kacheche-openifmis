import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, map } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { BudgetService } from '../../core/services/budget.service';
import { DepartmentService } from '../../core/services/department.service';
import { ExpenseService } from '../../core/services/expense';
import { AuthService } from '../../core/services/auth.service';
import { RoleService } from '../../core/services/role.service';
import { UserService } from '../../core/services/user.service';
import { describeError } from '../../core/utils/http-error';
import { AUDIT_ENTITIES } from '../../shared/audit/audit-config';
import { AuditTimeline } from '../../shared/components/audit-timeline/audit-timeline';

interface AuditTarget {
  id: number;
  label: string;
}

/**
 * Centre de traçabilité : consulter l'audit trail de n'importe quel élément,
 * y compris un élément supprimé (en saisissant son identifiant).
 * Le détail est affiché par le même composant que le bouton "Audit" des listes.
 */
@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AuditTimeline,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './audit.html',
  styleUrl: './audit.scss'
})
export class Audit implements OnInit {

  private readonly departmentService = inject(DepartmentService);
  private readonly budgetService = inject(BudgetService);
  private readonly expenseService = inject(ExpenseService);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly authService = inject(AuthService);

  // Types d'éléments consultables (issus de la configuration d'audit).
  readonly entities = Object.entries(AUDIT_ENTITIES).map(([key, config]) => ({
    key,
    ...config
  }));

  readonly entity = signal<string>(this.entities[0].key);
  readonly targets = signal<AuditTarget[]>([]);
  readonly selectedId = signal<number | null>(null);

  readonly isLoadingTargets = signal(false);
  readonly errorMessage = signal('');

  // Saisie directe d'un identifiant (utile pour un élément supprimé).
  readonly manualId = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(1)
  ]);

  // Liste déroulante de chaque type d'élément.
  private readonly loaders: Record<string, () => Observable<AuditTarget[]>> = {

    departments: () => this.departmentService.getAll().pipe(
      map(items => items.map(item => ({
        id: item.id,
        label: `${item.name} (${item.code})`
      })))
    ),

    budgets: () => this.budgetService.getAll().pipe(
      map(items => items.map(item => ({
        id: item.id,
        label: `${item.name} — ${item.fiscalYear}`
      })))
    ),

    expenses: () => this.expenseService.getAll().pipe(
      map(items => items.map(item => ({
        id: item.id,
        label: `#${item.id} — ${item.description}`
      })))
    ),

    users: () => this.userService.getAll().pipe(
      map(items => items.map(item => ({
        id: item.id,
        label: `${item.fullName || item.username} (${item.username})`
      })))
    ),

    roles: () => this.roleService.getAll().pipe(
      map(items => items.map(item => ({
        id: item.id,
        label: item.name
      })))
    )
  };

  ngOnInit(): void {
    this.loadTargets();
  }

  get currentConfig() {
    return AUDIT_ENTITIES[this.entity()];
  }

  // Peut-on LISTER ce type d'éléments ? Sinon, seule la saisie d'un identifiant reste possible.
  get canListCurrent(): boolean {
    const permission = this.currentConfig.readPermission;

    return !permission || this.authService.hasPermission(permission);
  }

  selectEntity(key: string): void {

    if (key === this.entity()) {
      return;
    }

    this.entity.set(key);
    this.selectedId.set(null);
    this.manualId.reset();

    this.loadTargets();
  }

  selectTarget(id: number | null): void {
    this.selectedId.set(id);
    this.manualId.reset();
  }

  openManualId(): void {

    if (this.manualId.invalid || this.manualId.value === null) {
      this.manualId.markAsTouched();
      return;
    }

    this.selectedId.set(Number(this.manualId.value));
  }

  private loadTargets(): void {

    const loader = this.loaders[this.entity()];

    this.targets.set([]);
    this.errorMessage.set('');

    if (!loader || !this.canListCurrent) {
      return;
    }

    this.isLoadingTargets.set(true);

    loader().subscribe({

      next: (targets) => {
        this.targets.set(targets);
        this.isLoadingTargets.set(false);
      },

      error: (error) => {
        console.error('Erreur chargement de la liste d’audit :', error);

        this.errorMessage.set(
          describeError(error, 'Impossible de charger la liste des éléments.')
        );

        this.isLoadingTargets.set(false);
      }

    });
  }
}
