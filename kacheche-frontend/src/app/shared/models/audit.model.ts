
export interface BudgetAudit {
  budgetId: number;
  revision: number;
  operation: string;
  revisionDate: string;
  username: string;
  budgetName: string;
  fiscalYear: number;
  totalAmount: number;
  currency: 'USD' | 'CDF';
  departmentId: number;
}

export interface ExpenseAudit {
  expenseId: number;
  revision: number;
  operation: string;
  revisionDate: string;
  username: string;
  description: string;
  amount: number;
  expenseDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  rejectionReason: string | null;
  budgetId: number | null;
  budgetName: string | null;
}
