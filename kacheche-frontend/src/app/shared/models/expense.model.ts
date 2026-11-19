import { Versioned } from './base.model';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Expense extends Versioned {
  description: string;
  amount: number;
  expenseDate: string;
  status: ExpenseStatus;
  rejectionReason: string | null;
  budgetId: number;
  budgetName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseRequest {
  description: string;
  amount: number;
  expenseDate: string;
  budgetId: number;
}
