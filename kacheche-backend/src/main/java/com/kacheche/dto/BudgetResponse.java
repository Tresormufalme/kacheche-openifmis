package com.kacheche.dto;

import java.math.BigDecimal;

public record BudgetResponse(
        Long id,
        String name,
        Integer fiscalYear,
        BigDecimal totalAmount,
        String currency,
        DepartmentSummaryResponse department,
        Long version
) {
}
