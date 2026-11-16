import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import { DashboardService } from '../../core/services/dashboard.service';
import {
  DashboardSummary,
  DepartmentExecution,
  RecentActivity
} from '../../shared/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoading = true;
  errorMessage = '';
  summary: DashboardSummary | null = null;

  stats = [
    {
      title: 'Départements',
      value: '0',
      description: 'Unités administratives',
      icon: 'business',
      color: 'blue'
    },
    {
      title: 'Budgets',
      value: '0',
      description: 'Budgets enregistrés',
      icon: 'account_balance_wallet',
      color: 'purple'
    },
    {
      title: 'Budget total',
      value: '0 $',
      description: 'Allocation globale',
      icon: 'payments',
      color: 'green'
    },
    {
      title: 'Opérations',
      value: '0',
      description: 'Opérations auditées',
      icon: 'receipt_long',
      color: 'orange'
    }
  ];

  budgetExecution: DepartmentExecution[] = [];
  recentActivities: RecentActivity[] = [];
  fiscalYear = 2026;
  totalBudgetAmount = 0;
  totalSpentAmount = 0;
  overallExecutionRate = 0;
  currency = 'USD';

  ngOnInit(): void {
    this.loadDashboard();
  }
  

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.fiscalYear = data.fiscalYear || 2026;
        this.totalBudgetAmount = data.totalBudgetAmount || 0;
        this.totalSpentAmount = data.totalSpentAmount || 0;
        this.overallExecutionRate = data.overallExecutionRate || 0;
        this.currency = data.currency || 'USD';
        this.budgetExecution = data.departmentExecutions || [];
        this.recentActivities = data.recentActivities || [];

        const currSymbol = this.currency === 'USD' ? '$' : this.currency;

        this.stats = [
          {
            title: 'Départements',
            value: data.totalDepartments.toString(),
            description: 'Unités administratives',
            icon: 'business',
            color: 'blue'
          },
          {
            title: 'Budgets',
            value: data.totalBudgets.toString(),
            description: 'Budgets enregistrés',
            icon: 'account_balance_wallet',
            color: 'purple'
          },
          {
            title: 'Budget total',
            value: `${this.formatAmount(data.totalBudgetAmount)} ${currSymbol}`,
            description: 'Allocation globale',
            icon: 'payments',
            color: 'green'
          },
          {
            title: 'Opérations',
            value: data.totalOperations.toString(),
            description: 'Opérations auditées',
            icon: 'receipt_long',
            color: 'orange'
          }
        ];

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement tableau de bord', err);
        this.errorMessage = 'Impossible de charger les données du tableau de bord depuis le serveur.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount || 0);
  }
  

  // ==========================================
  // GRAPHIQUE : RÉPARTITION DES DÉPENSES
  // ==========================================

  get totalExpenses(): number {
    return (
      (this.summary?.expenseStatus?.pending ?? 0) +
      (this.summary?.expenseStatus?.approved ?? 0) +
      (this.summary?.expenseStatus?.rejected ?? 0)
    );
  }

  get approvedPercentage(): number {
    return this.calculateExpensePercentage(
      this.summary?.expenseStatus?.approved ?? 0
    );
  }

  get pendingPercentage(): number {
    return this.calculateExpensePercentage(
      this.summary?.expenseStatus?.pending ?? 0
    );
  }

  get rejectedPercentage(): number {
    return this.calculateExpensePercentage(
      this.summary?.expenseStatus?.rejected ?? 0
    );
  }

  private calculateExpensePercentage(value: number): number {
    if (this.totalExpenses === 0) {
      return 0;
    }

    return (value / this.totalExpenses) * 100;
  }

  get expenseDonutBackground(): string {
    const approved = this.approvedPercentage;
    const pending = approved + this.pendingPercentage;

    return `conic-gradient(
      #19945b 0% ${approved}%,
      #e18a2b ${approved}% ${pending}%,
      #d64c4c ${pending}% 100%
    )`;
  }

}
