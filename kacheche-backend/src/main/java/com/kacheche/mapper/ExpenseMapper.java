package com.kacheche.mapper;

import com.kacheche.dto.ExpenseRequest;
import com.kacheche.dto.ExpenseResponse;
import com.kacheche.entity.Budget;
import com.kacheche.entity.Expense;
import org.springframework.stereotype.Component;

@Component
public class ExpenseMapper implements EntityMapper<Expense, ExpenseRequest, ExpenseResponse> {

    @Override
    public Expense toEntity(ExpenseRequest r) {
        Expense e = new Expense();
        e.setDescription(r.description());
        e.setAmount(r.amount());
        e.setExpenseDate(r.expenseDate());
        e.setBudget(new Budget(r.budgetId()));
        return e;
    }

    @Override
    public ExpenseResponse toResponse(Expense e) {
        return new ExpenseResponse(e.getId(), e.getDescription(), e.getAmount(),
                e.getExpenseDate(), e.getStatus(), e.getRejectionReason(),
                e.getBudget().getId(), e.getBudget().getName(),
                e.getCreatedAt(), e.getUpdatedAt(), e.getVersion());
    }
}
