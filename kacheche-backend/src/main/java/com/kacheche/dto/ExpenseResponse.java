
package com.kacheche.dto;

import com.kacheche.enums.ExpenseStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ExpenseResponse(

        Long id,

        String description,

        BigDecimal amount,

        LocalDate expenseDate,

        ExpenseStatus status,

        String rejectionReason,

        Long budgetId,

        String budgetName,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {}
