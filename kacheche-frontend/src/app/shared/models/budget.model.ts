import { Versioned } from './base.model';
import { DepartmentSummary } from './department.model';

export type Currency = 'USD' | 'CDF';

export interface Budget extends Versioned {
  name: string;
  fiscalYear: number;
  totalAmount: number;
  currency: Currency;
  department: DepartmentSummary;
}

export interface BudgetRequest {
  name: string;
  fiscalYear: number;
  totalAmount: number;
  currency: Currency;
  departmentId: number;
}
