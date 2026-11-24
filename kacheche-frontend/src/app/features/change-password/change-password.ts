import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/services/auth.service';
import { describeError } from '../../core/utils/http-error';
import {
  PASSWORD_HINT,
  PASSWORD_PATTERN,
  passwordChecks
} from '../../core/utils/password-policy';

function samePassword(group: AbstractControl): ValidationErrors | null {
  const next = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;

  return next === confirm ? null : { mismatch: true };
}

/**
 * Changement de mot de passe.
 * Obligatoire (écran plein, sans menu) tant que le mot de passe est provisoire.
 */
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss'
})
export class ChangePassword {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);

  readonly hint = PASSWORD_HINT;
  readonly hide = signal(true);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.pattern(PASSWORD_PATTERN)
      ]],
      confirmPassword: ['', Validators.required]
    },
    { validators: samePassword }
  );

  // Vrai tant que le mot de passe actuel est provisoire (écran obligatoire).
  get isForced(): boolean {
    return this.authService.mustChangePassword();
  }

  get checks() {
    return passwordChecks(this.form.controls.newPassword.value);
  }

  submit(): void {

    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.form.getRawValue();

    this.isSaving.set(true);
    this.errorMessage.set('');

    this.authService.changePassword(currentPassword, newPassword).subscribe({

      next: () => {
        this.isSaving.set(false);
        this.router.navigate([this.authService.homeRoute()]);
      },

      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          describeError(error, 'Impossible de changer le mot de passe.')
        );
      }

    });
  }

  cancel(): void {

    // Écran obligatoire : la seule sortie est la déconnexion.
    if (this.isForced) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate([this.authService.homeRoute()]);
  }
}
