package com.kacheche.service;

import com.kacheche.dto.ExpenseResponse;
import com.kacheche.entity.Expense;
import com.kacheche.enums.ExpenseStatus;
import com.kacheche.exception.ResourceNotFoundException;
import com.kacheche.mapper.ExpenseMapper;
import com.kacheche.repository.BudgetRepository;
import com.kacheche.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseQuery extends BaseQuery<Expense, ExpenseResponse, ExpenseRepository> {

    private final BudgetRepository budgetRepository;

    public ExpenseQuery(final ExpenseRepository repository,
                        final ExpenseMapper mapper,
                        final BudgetRepository budgetRepository) {
        super(repository, mapper, "Dépense");
        this.budgetRepository = budgetRepository;
    }

    public List<ExpenseResponse> findByBudgetId(Long budgetId) {
        if (!budgetRepository.existsById(budgetId)) {
            throw new ResourceNotFoundException(
                    "Budget introuvable avec l'identifiant : " + budgetId);
        }
        return toResponses(repository.findByBudgetId(budgetId));
    }

    public List<ExpenseResponse> findByStatus(ExpenseStatus status) {
        return toResponses(repository.findByStatus(status));
    }
}
