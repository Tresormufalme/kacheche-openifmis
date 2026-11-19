import { Component, inject } from '@angular/core';
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

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  icon?: string;
  tone?: 'danger' | 'success' | 'primary';
  // Si renseigné, la boîte demande un motif obligatoire (ex. rejet d'une dépense).
  reasonLabel?: string;
}

export interface ConfirmDialogResult {
  reason: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialog {

  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  private readonly dialogRef =
    inject<MatDialogRef<ConfirmDialog, ConfirmDialogResult>>(MatDialogRef);

  readonly reason = new FormControl('', {
    nonNullable: true,
    validators: this.data.reasonLabel
      ? [Validators.required, Validators.maxLength(500)]
      : []
  });

  confirm(): void {

    if (this.reason.invalid) {
      this.reason.markAsTouched();
      return;
    }

    this.dialogRef.close({ reason: this.reason.value.trim() });
  }
}
