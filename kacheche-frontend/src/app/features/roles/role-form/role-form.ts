import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PermissionService } from '../../../core/services/permission.service';
import { RoleService } from '../../../core/services/role.service';
import { BaseEntityForm } from '../../../shared/base/base-entity-form';
import {
  Permission,
  Role,
  RoleRequest
} from '../../../shared/models/role.model';

interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './role-form.html',
  styleUrl: './role-form.scss'
})
export class RoleForm extends BaseEntityForm<Role, RoleRequest> implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly permissionService = inject(PermissionService);

  protected override readonly service = inject(RoleService);

  protected override readonly saveFailed =
    'Une erreur est survenue lors de l’enregistrement du rôle.';

  readonly catalog = signal<Permission[]>([]);
  readonly selected = signal<ReadonlySet<string>>(new Set());
  readonly isLoadingCatalog = signal(false);

  // Permissions regroupées par domaine (Départements, Budgets, ...).
  readonly groups = computed<PermissionGroup[]>(() => {
    const byGroup = new Map<string, Permission[]>();

    for (const permission of this.catalog()) {
      const list = byGroup.get(permission.group) ?? [];
      list.push(permission);
      byGroup.set(permission.group, list);
    }

    return [...byGroup.entries()].map(([name, permissions]) => ({ name, permissions }));
  });

  // Mêmes règles que RoleRequest côté Spring Boot.
  override readonly form = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
      Validators.pattern(/^[A-Za-z][A-Za-z0-9_]*$/)
    ]],
    description: ['', [Validators.maxLength(255)]]
  });

  // Le rôle ADMIN possède toujours toutes les permissions (règle du backend).
  get isAdminRole(): boolean {
    return this.entity?.name === 'ADMIN';
  }

  get isSystemRole(): boolean {
    return this.entity?.systemRole ?? false;
  }

  ngOnInit(): void {
    this.loadCatalog();
  }

  private loadCatalog(): void {

    this.isLoadingCatalog.set(true);

    this.permissionService.getAll().subscribe({

      next: (permissions) => {
        this.catalog.set(permissions ?? []);
        this.isLoadingCatalog.set(false);
        this.applyAdminLock();
      },

      error: (error) => {
        console.error('Erreur chargement des permissions :', error);
        this.errorMessage.set('Impossible de charger le catalogue des permissions.');
        this.isLoadingCatalog.set(false);
      }

    });
  }

  protected override populate(role: Role | null): void {

    this.form.reset({
      name: role?.name ?? '',
      description: role?.description ?? ''
    });

    // Un rôle système ne peut pas être renommé.
    if (role?.systemRole) {
      this.form.controls.name.disable();
    } else {
      this.form.controls.name.enable();
    }

    this.selected.set(new Set(role?.permissions ?? []));
    this.applyAdminLock();
  }

  private applyAdminLock(): void {
    if (this.isAdminRole && this.catalog().length > 0) {
      this.selected.set(new Set(this.catalog().map(permission => permission.code)));
    }
  }

  protected override toRequest(): RoleRequest {
    const value = this.form.getRawValue();

    return {
      name: value.name.trim(),
      description: value.description.trim(),
      permissions: [...this.selected()].sort()
    };
  }

  // ---------- SÉLECTION DES PERMISSIONS ----------

  isSelected(code: string): boolean {
    return this.selected().has(code);
  }

  toggle(code: string): void {

    if (this.isAdminRole) {
      return;
    }

    const next = new Set(this.selected());

    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }

    this.selected.set(next);
  }

  groupState(group: PermissionGroup): 'all' | 'some' | 'none' {
    const count = group.permissions.filter(p => this.selected().has(p.code)).length;

    if (count === 0) {
      return 'none';
    }

    return count === group.permissions.length ? 'all' : 'some';
  }

  toggleGroup(group: PermissionGroup): void {

    if (this.isAdminRole) {
      return;
    }

    const next = new Set(this.selected());
    const allSelected = this.groupState(group) === 'all';

    for (const permission of group.permissions) {
      if (allSelected) {
        next.delete(permission.code);
      } else {
        next.add(permission.code);
      }
    }

    this.selected.set(next);
  }
}
