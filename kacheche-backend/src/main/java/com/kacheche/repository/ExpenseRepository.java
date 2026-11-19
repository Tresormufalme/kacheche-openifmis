package com.kacheche.repository;

import com.kacheche.entity.Expense;
import com.kacheche.enums.ExpenseStatus;

import java.util.List;

public interface ExpenseRepository extends BaseRepository<Expense> {

    List<Expense> findByBudgetId(Long budgetId);

    List<Expense> findByStatus(ExpenseStatus status);

    List<Expense> findByBudgetIdAndStatus(Long budgetId, ExpenseStatus status);
}
