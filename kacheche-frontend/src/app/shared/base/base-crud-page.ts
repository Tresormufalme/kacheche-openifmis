import { Directive, OnInit, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { BaseCrudService } from '../../core/services/base-crud.service';
import { describeError } from '../../core/utils/http-error';
import {
  ConfirmDialog,
  ConfirmDialogData,
  ConfirmDialogResult
} from '../components/confirm-dialog/confirm-dialog';
import { Versioned } from '../models/base.model';

export interface CrudPageText {
  loadFailed: string;
  created: string;
  updated: string;
  deleted: string;
  deleteTitle: string;
  deleteFailed: string;
}

/**
 * Page de liste générique : chargement, formulaire création/modification,
 * suppression avec confirmation et messages. Chaque écran (départements,
 * budgets, dépenses) n'ajoute que ce qui lui est spécifique.
 */
@Directive()
export abstract class BaseCrudPage<T extends Versioned, R extends object>
  implements OnInit {

  protected readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  protected abstract readonly service: BaseCrudService<T, R>;
  protected abstract readonly text: CrudPageText;

  // Préfixe des permissions de la ressource : 'DEPARTMENT' -> DEPARTMENT_CREATE...
  protected abstract readonly resource: string;
  protected abstract deleteMessage(item: T): string;

  readonly items = signal<T[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly showForm = signal(false);
  readonly selected = signal<T | null>(null);

  // ---------- DROITS DE L'UTILISATEUR CONNECTÉ ----------
  get canCreate(): boolean {
    return this.can('CREATE');
  }

  get canUpdate(): boolean {
    return this.can('UPDATE');
  }

  get canDelete(): boolean {
    return this.can('DELETE');
  }

  // Le bouton Audit exige la permission AUDIT_READ.
  get canAudit(): boolean {
    return this.authService.hasPermission('AUDIT_READ');
  }

  protected can(action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE'): boolean {
    return this.authService.hasPermission(`${this.resource}_${action}`);
  }

  ngOnInit(): void {
    this.load();
  }

  // Source des données : surchargée par les écrans qui filtrent.
  protected fetch(): Observable<T[]> {
    return this.service.getAll();
  }

  load(): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.fetch().subscribe({

      next: (items) => {
        this.items.set(items ?? []);
        this.isLoading.set(false);
      },

      error: (error) => {
        console.error(this.text.loadFailed, error);
        this.errorMessage.set(describeError(error, this.text.loadFailed));
        this.isLoading.set(false);
      }

    });
  }

  openCreateForm(): void {
    this.selected.set(null);
    this.showForm.set(true);
    this.clearMessages();
  }

  openEditForm(item: T): void {
    this.selected.set(item);
    this.showForm.set(true);
    this.clearMessages();
  }

  closeForm(): void {
    this.showForm.set(false);
    this.selected.set(null);
  }

  onSaved(): void {

    const wasEditing = this.selected() !== null;

    this.closeForm();

    this.successMessage.set(wasEditing ? this.text.updated : this.text.created);
    this.errorMessage.set('');

    this.load();
  }

  // Un autre utilisateur a modifié l'élément : on ferme et on recharge.
  onConflict(message: string): void {
    this.closeForm();
    this.successMessage.set('');
    this.load();
    this.errorMessage.set(message);
  }

  remove(item: T): void {

    if (!this.canDelete) {
      return;
    }

    this.confirm({
      title: this.text.deleteTitle,
      message: this.deleteMessage(item),
      confirmLabel: 'Supprimer',
      icon: 'delete_outline',
      tone: 'danger'
    }).subscribe((result) => {

      if (!result) {
        return;
      }

      this.clearMessages();

      this.service.delete(item.id).subscribe({

        next: () => {
          this.successMessage.set(this.text.deleted);
          this.load();
        },

        error: (error) => {
          console.error(this.text.deleteFailed, error);
          this.errorMessage.set(describeError(error, this.text.deleteFailed));
        }

      });
    });
  }

  protected confirm(data: ConfirmDialogData): Observable<ConfirmDialogResult | undefined> {
    return this.dialog
      .open<ConfirmDialog, ConfirmDialogData, ConfirmDialogResult>(ConfirmDialog, {
        data,
        width: '460px',
        maxWidth: '94vw',
        autoFocus: 'dialog'
      })
      .afterClosed();
  }

  protected clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
