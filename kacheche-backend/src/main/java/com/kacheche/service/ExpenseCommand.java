package com.kacheche.service;

import com.kacheche.dto.ExpenseRequest;
import com.kacheche.entity.Budget;
import com.kacheche.entity.Expense;
import com.kacheche.enums.ExpenseStatus;
import com.kacheche.exception.ResourceNotFoundException;
import com.kacheche.mapper.ExpenseMapper;
import com.kacheche.repository.BudgetRepository;
import com.kacheche.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ExpenseCommand extends BaseCommand<Expense, ExpenseRequest, ExpenseRepository> {

    private final BudgetRepository budgetRepository;

    public ExpenseCommand(final ExpenseRepository repository,
                          final ExpenseMapper mapper,
                          final BudgetRepository budgetRepository) {
        super(repository, mapper, "Dépense");
        this.budgetRepository = budgetRepository;
    }

    // ---------- HOOKS ----------

    @Override
    protected void prepare(Expense expense) {
        Long budgetId = expense.getBudget().getId();
        expense.setBudget(budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Budget introuvable avec l'identifiant : " + budgetId)));
    }

    @Override
    protected void validateUpdate(Expense existing, Expense incoming) {
        if (existing.getStatus() == ExpenseStatus.REJECTED) {
            throw new IllegalStateException("Une dépense rejetée ne peut pas être modifiée.");
        }
        if (existing.getStatus() == ExpenseStatus.APPROVED) {
            validateBudgetCapacity(incoming.getBudget(), incoming.getAmount(), existing.getId());
        }
    }

    @Override
    protected void copy(Expense target, Expense source) {
        target.setDescription(source.getDescription());
        target.setAmount(source.getAmount());
        target.setExpenseDate(source.getExpenseDate());
        target.setBudget(source.getBudget());
    }

    // ---------- COMMANDES MÉTIER ----------

    public void approve(Long id, Long version) {
        Expense expense = getOrThrow(id);
        checkVersion(expense, version);

        if (expense.getStatus() != ExpenseStatus.PENDING) {
            throw new IllegalStateException("Seules les dépenses en attente peuvent être approuvées.");
        }

        validateBudgetCapacity(expense.getBudget(), expense.getAmount(), null);

        expense.setStatus(ExpenseStatus.APPROVED);
        expense.setRejectionReason(null);
        repository.saveAndFlush(expense);
    }

    public void reject(Long id, String reason, Long version) {
        Expense expense = getOrThrow(id);
        checkVersion(expense, version);

        if (expense.getStatus() != ExpenseStatus.PENDING) {
            throw new IllegalStateException("Seules les dépenses en attente peuvent être rejetées.");
        }
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Le motif du rejet est obligatoire.");
        }

        expense.setStatus(ExpenseStatus.REJECTED);
        expense.setRejectionReason(reason.trim());
        repository.saveAndFlush(expense);
    }

    // ---------- PRIVÉ ----------

    private void validateBudgetCapacity(Budget budget, BigDecimal newAmount, Long excludedExpenseId) {
        BigDecimal approvedAmount = repository
                .findByBudgetIdAndStatus(budget.getId(), ExpenseStatus.APPROVED)
                .stream()
                .filter(e -> excludedExpenseId == null || !e.getId().equals(excludedExpenseId))
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (approvedAmount.add(newAmount).compareTo(budget.getTotalAmount()) > 0) {
            throw new IllegalArgumentException(
                    "Budget insuffisant. Montant disponible : "
                            + budget.getTotalAmount().subtract(approvedAmount));
        }
    }
}
