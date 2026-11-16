package com.kacheche.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardSummaryResponse(
        long totalDepartments,
        long totalBudgets,
        BigDecimal totalBudgetAmount,
        String currency,
        Integer fiscalYear,
        BigDecimal totalSpentAmount,
        double overallExecutionRate,
        long totalOperations,
        List<DepartmentExecutionDto> departmentExecutions,
        List<RecentActivityDto> recentActivities,
        ExpenseStatusDto expenseStatus
) {
    public record DepartmentExecutionDto(
            Long departmentId,
            String department,
            BigDecimal allocated,
            BigDecimal spent,
            double percentage
    ) {}

    public record RecentActivityDto(
            Long revisionId,
            String title,
            String description,
            String user,
            String time,
            String icon,
            String color,
            String timestamp
    ) {}

    public record ExpenseStatusDto(
            long pending,
            long approved,
            long rejected
    ) {}
}
