export interface DepartmentExecution {
  departmentId: number;
  department: string;
  allocated: number;
  spent: number;
  percentage: number;
}

export interface RecentActivity {
  revisionId: number;
  title: string;
  description: string;
  user: string;
  time: string;
  icon: string;
  color: string;
  timestamp: string;
}

export interface ExpenseStatus {
  pending: number;
  approved: number;
  rejected: number;
}

export interface DashboardSummary {
  totalDepartments: number;
  totalBudgets: number;
  totalBudgetAmount: number;
  currency: string;
  fiscalYear: number;
  totalSpentAmount: number;
  overallExecutionRate: number;
  totalOperations: number;
  departmentExecutions: DepartmentExecution[];
  recentActivities: RecentActivity[];
  expenseStatus: ExpenseStatus;
}
