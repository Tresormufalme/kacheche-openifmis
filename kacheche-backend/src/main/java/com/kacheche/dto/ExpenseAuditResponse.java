
package com.kacheche.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record ExpenseAuditResponse(
        Long expenseId,
        Integer revision,
        String operation,
        Instant revisionDate,
        String username,
        String description,
        BigDecimal amount,
        LocalDate expenseDate,
        String status,
        String rejectionReason,
        Long budgetId,
        String budgetName
) {
}
