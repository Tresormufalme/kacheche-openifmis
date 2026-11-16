
import { Department } from './department.model';

export interface Budget {
  id: number;
  name: string;
  fiscalYear: number;
  totalAmount: number;
  currency: 'USD' | 'CDF';
  department: Department;
}

export interface BudgetRequest {
  name: string;
  fiscalYear: number;
  totalAmount: number;
  currency: 'USD' | 'CDF';
  departmentId: number;
}
