import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { RoleService } from '../../../core/services/role.service';
import { UserService } from '../../../core/services/user.service';
import {
  PASSWORD_HINT,
  PASSWORD_PATTERN,
  generatePassword
} from '../../../core/utils/password-policy';
import { BaseEntityForm } from '../../../shared/base/base-entity-form';
import { Role } from '../../../shared/models/role.model';
import { AppUser, UserRequest } from '../../../shared/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserForm extends BaseEntityForm<AppUser, UserRequest> implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);

  protected override readonly service = inject(UserService);

  protected override readonly saveFailed =
    'Une erreur est survenue lors de l’enregistrement de l’utilisateur.';

  readonly passwordHint = PASSWORD_HINT;
  readonly roles = signal<Role[]>([]);
  readonly isLoadingRoles = signal(false);
  readonly showPassword = signal(false);

  // Mêmes règles que UserRequest côté Spring Boot.
  override readonly form = this.fb.nonNullable.group({
    username: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
      Validators.pattern(/^[A-Za-z0-9._-]+$/)
    ]],
    fullName: ['', [Validators.maxLength(150)]],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    password: [''],
    roleIds: [[] as number[], [Validators.required, Validators.minLength(1)]],
    enabled: [true]
  });

  ngOnInit(): void {
    this.loadRoles();
  }

  private loadRoles(): void {

    this.isLoadingRoles.set(true);

    this.roleService.getAll().subscribe({

      next: (roles) => {
        this.roles.set(roles ?? []);
        this.isLoadingRoles.set(false);
      },

      error: (error) => {
        console.error('Erreur chargement des rôles :', error);
        this.errorMessage.set('Impossible de charger la liste des rôles.');
        this.isLoadingRoles.set(false);
      }

    });
  }

  protected override populate(user: AppUser | null): void {

    const { username, password } = this.form.controls;

    this.form.reset({
      username: user?.username ?? '',
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      password: '',
      roleIds: user ? user.roles.map(role => role.id) : [],
      enabled: user?.enabled ?? true
    });

    this.showPassword.set(false);

    if (user) {
      // Le nom d'utilisateur ne change jamais ; le mot de passe se réinitialise
      // depuis la liste.
      username.disable();
      password.clearValidators();
    } else {
      username.enable();
      password.setValidators([
        Validators.required,
        Validators.pattern(PASSWORD_PATTERN)
      ]);
    }

    password.updateValueAndValidity();
  }

  protected override toRequest(): UserRequest {
    const value = this.form.getRawValue();

    return {
      username: value.username.trim(),
      fullName: value.fullName.trim(),
      email: value.email.trim(),
      password: this.isEditMode ? null : value.password,
      roleIds: value.roleIds,
      enabled: value.enabled
    };
  }

  generate(): void {
    this.form.controls.password.setValue(generatePassword());
    this.form.controls.password.markAsTouched();
    this.showPassword.set(true);
  }
}
