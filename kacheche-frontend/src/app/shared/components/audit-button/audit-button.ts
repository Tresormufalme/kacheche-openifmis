import { Component, Input, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuditDialog, AuditDialogData } from '../audit-dialog/audit-dialog';

/**
 * Bouton "Audit" réutilisable, à placer à côté de Modifier / Supprimer :
 *   <app-audit-button entity="budgets" [entityId]="budget.id" [label]="budget.name" />
 * Fonctionne pour toute entité auditée, présente ou future.
 */
@Component({
  selector: 'app-audit-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button
      mat-icon-button
      type="button"
      class="k-btn-audit"
      matTooltip="Historique des modifications"
      aria-label="Voir l’audit trail"
      (click)="open()">
      <mat-icon>history</mat-icon>
    </button>
  `
})
export class AuditButton {

  private readonly dialog = inject(MatDialog);

  // Clé d'URL de l'entité : departments, budgets, expenses...
  @Input({ required: true }) entity!: string;

  @Input({ required: true }) entityId!: number;

  // Texte affiché dans l'en-tête de la fenêtre.
  @Input() label = '';

  open(): void {
    this.dialog.open<AuditDialog, AuditDialogData>(AuditDialog, {
      data: {
        entity: this.entity,
        entityId: this.entityId,
        title: this.label || `#${this.entityId}`
      },
      panelClass: 'k-audit-dialog',
      width: '900px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      autoFocus: false
    });
  }
}
