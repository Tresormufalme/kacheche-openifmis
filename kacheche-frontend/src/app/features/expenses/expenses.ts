import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ExpenseService } from '../../core/services/expense';
import { describeError, isVersionConflict } from '../../core/utils/http-error';
import { BaseCrudPage, CrudPageText } from '../../shared/base/base-crud-page';
import { AuditButton } from '../../shared/components/audit-button/audit-button';
import {
  Expense,
  ExpenseRequest,
  ExpenseStatus
} from '../../shared/models/expense.model';
import { ExpenseForm } from './expense-form/expense-form';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    AuditButton,
    ExpenseForm,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss'
})
export class Expenses extends BaseCrudPage<Expense, ExpenseRequest> {

  protected override readonly service = inject(ExpenseService);

  protected override readonly text: CrudPageText = {
    loadFailed: 'Impossible de charger les dépenses. Vérifiez votre connexion.',
    created: 'La dépense a été créée avec succès.',
    updated: 'La dépense a été modifiée avec succès.',
    deleted: 'La dépense a été supprimée avec succès.',
    deleteTitle: 'Supprimer la dépense',
    deleteFailed: 'Impossible de supprimer cette dépense.'
  };

  // ---------- FILTRE PAR STATUT ----------
  readonly statusFilter = signal<ExpenseStatus | 'ALL'>('ALL');

  readonly filtered = computed(() => {
    const status = this.statusFilter();

    return status === 'ALL'
      ? this.items()
      : this.items().filter(expense => expense.status === status);
  });

  // ---------- STATISTIQUES ----------
  readonly pendingCount = computed(() => this.countBy('PENDING'));
  readonly approvedCount = computed(() => this.countBy('APPROVED'));
  readonly rejectedCount = computed(() => this.countBy('REJECTED'));

  readonly totalApprovedAmount = computed(() =>
    this.items()
      .filter(expense => expense.status === 'APPROVED')
      .reduce((total, expense) => total + expense.amount, 0)
  );

  private countBy(status: ExpenseStatus): number {
    return this.items().filter(expense => expense.status === status).length;
  }

  protected override deleteMessage(expense: Expense): string {
    return `Voulez-vous vraiment supprimer la dépense « ${expense.description} » ? ` +
      'Cette action est enregistrée dans l’audit trail.';
  }

  // ---------- WORKFLOW ----------
  approve(expense: Expense): void {

    if (!this.isAdmin || expense.status !== 'PENDING') {
      return;
    }

    this.confirm({
      title: 'Approuver la dépense',
      message: `Approuver « ${expense.description} » ? Le montant sera imputé sur le budget « ${expense.budgetName} ».`,
      confirmLabel: 'Approuver',
      icon: 'verified',
      tone: 'success'
    }).subscribe((result) => {

      if (!result) {
        return;
      }

      this.clearMessages();

      this.service.approve(expense).subscribe({
        next: () => {
          this.successMessage.set('La dépense a été approuvée avec succès.');
          this.load();
        },
        error: (error) => this.onWorkflowError(error, 'Impossible d’approuver cette dépense.')
      });
    });
  }

  reject(expense: Expense): void {

    if (!this.isAdmin || expense.status !== 'PENDING') {
      return;
    }

    this.confirm({
      title: 'Rejeter la dépense',
      message: `Rejeter « ${expense.description} » ? Un motif est obligatoire.`,
      confirmLabel: 'Rejeter',
      icon: 'cancel',
      tone: 'danger',
      reasonLabel: 'Motif du rejet'
    }).subscribe((result) => {

      if (!result) {
        return;
      }

      this.clearMessages();

      this.service.reject(expense, result.reason).subscribe({
        next: () => {
          this.successMessage.set('La dépense a été rejetée avec succès.');
          this.load();
        },
        error: (error) => this.onWorkflowError(error, 'Impossible de rejeter cette dépense.')
      });
    });
  }

  private onWorkflowError(error: unknown, fallback: string): void {
    console.error(fallback, error);

    if (isVersionConflict(error)) {
      this.load();
      this.errorMessage.set(
        'Cette dépense a été modifiée par un autre utilisateur. La liste a été actualisée : vérifiez-la puis recommencez.'
      );
      return;
    }

    this.errorMessage.set(describeError(error, fallback));
  }

  // ---------- AFFICHAGE ----------
  statusLabel(status: ExpenseStatus): string {
    const labels: Record<ExpenseStatus, string> = {
      PENDING: 'En attente',
      APPROVED: 'Approuvée',
      REJECTED: 'Rejetée'
    };

    return labels[status];
  }
}
