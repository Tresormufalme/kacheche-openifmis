package com.kacheche.repository;

import com.kacheche.entity.Expense;
import com.kacheche.enums.ExpenseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // Retrouver toutes les dépenses liées à un budget
    List<Expense> findByBudgetId(Long budgetId);

    // Retrouver les dépenses selon leur statut
    List<Expense> findByStatus(ExpenseStatus status);

    // Retrouver les dépenses d'un budget selon leur statut
    List<Expense> findByBudgetIdAndStatus(
            Long budgetId,
            ExpenseStatus status
    );
}