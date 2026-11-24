import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UserService } from '../../core/services/user.service';
import { describeError } from '../../core/utils/http-error';
import { BaseCrudPage, CrudPageText } from '../../shared/base/base-crud-page';
import { AuditButton } from '../../shared/components/audit-button/audit-button';
import {
  ResetPasswordDialog,
  ResetPasswordDialogData
} from '../../shared/components/reset-password-dialog/reset-password-dialog';
import { AppUser, UserRequest } from '../../shared/models/user.model';
import { UserForm } from './user-form/user-form';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    DatePipe,
    AuditButton,
    UserForm,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users extends BaseCrudPage<AppUser, UserRequest> {

  protected override readonly service = inject(UserService);
  private readonly dialogs = inject(MatDialog);

  protected override readonly resource = 'USER';

  protected override readonly text: CrudPageText = {
    loadFailed: 'Impossible de charger les utilisateurs.',
    created: 'L’utilisateur a été créé avec succès.',
    updated: 'L’utilisateur a été modifié avec succès.',
    deleted: 'L’utilisateur a été supprimé avec succès.',
    deleteTitle: 'Supprimer l’utilisateur',
    deleteFailed: 'Impossible de supprimer cet utilisateur.'
  };

  protected override deleteMessage(user: AppUser): string {
    return `Voulez-vous vraiment supprimer le compte « ${user.username} » ? ` +
      'Ses sessions seront fermées. Cette action est enregistrée dans l’audit trail.';
  }

  get canResetPassword(): boolean {
    return this.authService.hasPermission('USER_RESET_PASSWORD');
  }

  // Le backend refuse de supprimer ou désactiver son propre compte.
  isSelf(user: AppUser): boolean {
    return this.authService.user()?.id === user.id;
  }

  resetPassword(user: AppUser): void {

    if (!this.canResetPassword) {
      return;
    }

    this.dialogs
      .open<ResetPasswordDialog, ResetPasswordDialogData, string>(ResetPasswordDialog, {
        data: { username: user.username },
        width: '500px',
        maxWidth: '94vw',
        autoFocus: false
      })
      .afterClosed()
      .subscribe((password) => {

        if (!password) {
          return;
        }

        this.clearMessages();

        this.service.resetPassword(user.id, password).subscribe({

          next: () => {
            this.successMessage.set(
              `Le mot de passe de « ${user.username} » a été réinitialisé. ` +
              'Il devra le changer à sa prochaine connexion.'
            );
            this.load();
          },

          error: (error) => {
            console.error('Erreur de réinitialisation :', error);
            this.errorMessage.set(
              describeError(error, 'Impossible de réinitialiser le mot de passe.')
            );
          }

        });
      });
  }
}
