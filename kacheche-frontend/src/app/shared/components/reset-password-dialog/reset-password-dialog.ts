import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import {
  PASSWORD_HINT,
  PASSWORD_PATTERN,
  generatePassword
} from '../../../core/utils/password-policy';

export interface ResetPasswordDialogData {
  username: string;
}

/**
 * Saisie (ou génération) d'un mot de passe provisoire pour un utilisateur.
 * Retourne le mot de passe choisi, ou undefined si annulé.
 */
@Component({
  selector: 'app-reset-password-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './reset-password-dialog.html',
  styleUrl: './reset-password-dialog.scss'
})
export class ResetPasswordDialog {

  readonly data = inject<ResetPasswordDialogData>(MAT_DIALOG_DATA);

  private readonly dialogRef =
    inject<MatDialogRef<ResetPasswordDialog, string>>(MatDialogRef);

  readonly hint = PASSWORD_HINT;
  readonly copied = signal(false);

  readonly password = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)]
  });

  generate(): void {
    this.password.setValue(generatePassword());
    this.password.markAsTouched();
    this.copied.set(false);
  }

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.password.value);
      this.copied.set(true);
    } catch {
      this.copied.set(false);
    }
  }

  confirm(): void {

    if (this.password.invalid) {
      this.password.markAsTouched();
      return;
    }

    this.dialogRef.close(this.password.value);
  }
}
