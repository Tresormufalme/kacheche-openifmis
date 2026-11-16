
package com.kacheche.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record BudgetAuditResponse(
        Long budgetId,
        Integer revision,
        String operation,
        Instant revisionDate,
        String username,
        String budgetName,
        Integer fiscalYear,
        BigDecimal totalAmount,
        String currency,
        Long departmentId
) {
}
