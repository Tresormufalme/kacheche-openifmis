
package com.kacheche.service;

import com.kacheche.dto.ExpenseRequest;
import com.kacheche.dto.ExpenseResponse;
import com.kacheche.entity.Budget;
import com.kacheche.entity.Expense;
import com.kacheche.enums.ExpenseStatus;
import com.kacheche.exception.ResourceNotFoundException;
import com.kacheche.repository.BudgetRepository;
import com.kacheche.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            BudgetRepository budgetRepository
    ) {
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
    }

    // 1. Enregistrer une nouvelle dépense
    public ExpenseResponse create(ExpenseRequest request) {

        Budget budget = findBudget(request.budgetId());

        Expense expense = new Expense();
        expense.setDescription(request.description());
        expense.setAmount(request.amount());
        expense.setExpenseDate(request.expenseDate());
        expense.setBudget(budget);
        expense.setStatus(ExpenseStatus.PENDING);

        Expense savedExpense = expenseRepository.save(expense);

        return toResponse(savedExpense);
    }

    // 2. Afficher toutes les dépenses
    @Transactional(readOnly = true)
    public List<ExpenseResponse> findAll() {

        return expenseRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // 3. Rechercher une dépense par son identifiant
    @Transactional(readOnly = true)
    public ExpenseResponse findResponseById(Long id) {

        Expense expense = findExpense(id);

        return toResponse(expense);
    }

    // 4. Afficher les dépenses d'un budget
    @Transactional(readOnly = true)
    public List<ExpenseResponse> findByBudgetId(Long budgetId) {

        findBudget(budgetId);

        return expenseRepository.findByBudgetId(budgetId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // 5. Filtrer les dépenses par statut
    @Transactional(readOnly = true)
    public List<ExpenseResponse> findByStatus(ExpenseStatus status) {

        return expenseRepository.findByStatus(status)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // 6. Modifier une dépense
    public ExpenseResponse update(Long id, ExpenseRequest request) {

        Expense expense = findExpense(id);
        Budget budget = findBudget(request.budgetId());

        if (expense.getStatus() != ExpenseStatus.PENDING
                && expense.getStatus() != ExpenseStatus.APPROVED) {
            throw new IllegalStateException(
                    "Une dépense rejetée ne peut pas être modifiée."
            );
        }

        if (expense.getStatus() == ExpenseStatus.APPROVED) {
            validateBudgetCapacity(
                    budget,
                    request.amount(),
                    expense.getId()
            );
        }

        expense.setDescription(request.description());
        expense.setAmount(request.amount());
        expense.setExpenseDate(request.expenseDate());
        expense.setBudget(budget);

        return toResponse(expenseRepository.save(expense));
    }

    // 7. Approuver une dépense
    public ExpenseResponse approve(Long id) {

        Expense expense = findExpense(id);

        if (expense.getStatus() != ExpenseStatus.PENDING) {
            throw new IllegalStateException(
                    "Seules les dépenses en attente peuvent être approuvées."
            );
        }

        validateBudgetCapacity(
                expense.getBudget(),
                expense.getAmount(),
                null
        );

        expense.setStatus(ExpenseStatus.APPROVED);
        expense.setRejectionReason(null);

        return toResponse(expenseRepository.save(expense));
    }

    // 8. Rejeter une dépense
    public ExpenseResponse reject(Long id, String reason) {

        Expense expense = findExpense(id);

        if (expense.getStatus() != ExpenseStatus.PENDING) {
            throw new IllegalStateException(
                    "Seules les dépenses en attente peuvent être rejetées."
            );
        }

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException(
                    "Le motif du rejet est obligatoire."
            );
        }

        expense.setStatus(ExpenseStatus.REJECTED);
        expense.setRejectionReason(reason.trim());

        return toResponse(expenseRepository.save(expense));
    }

    // 9. Supprimer une dépense
    public void delete(Long id) {

        Expense expense = findExpense(id);

        expenseRepository.delete(expense);
    }

    // Vérifier l'existence d'un budget
    private Budget findBudget(Long budgetId) {

        return budgetRepository.findById(budgetId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Budget introuvable avec l'identifiant : "
                                        + budgetId
                        )
                );
    }

    // Vérifier l'existence d'une dépense
    private Expense findExpense(Long id) {

        return expenseRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Dépense introuvable avec l'identifiant : "
                                        + id
                        )
                );
    }

    // Vérifier que le budget ne sera pas dépassé
    private void validateBudgetCapacity(
            Budget budget,
            BigDecimal newAmount,
            Long excludedExpenseId
    ) {

        BigDecimal approvedAmount = expenseRepository
                .findByBudgetIdAndStatus(
                        budget.getId(),
                        ExpenseStatus.APPROVED
                )
                .stream()
                .filter(expense ->
                        excludedExpenseId == null
                                || !expense.getId().equals(excludedExpenseId)
                )
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal projectedAmount = approvedAmount.add(newAmount);

        if (projectedAmount.compareTo(budget.getTotalAmount()) > 0) {
            throw new IllegalArgumentException(
                    "Budget insuffisant. Montant disponible : "
                            + budget.getTotalAmount()
                            .subtract(approvedAmount)
            );
        }
    }

    // Transformer une entité en DTO de réponse
    private ExpenseResponse toResponse(Expense expense) {

        return new ExpenseResponse(
                expense.getId(),
                expense.getDescription(),
                expense.getAmount(),
                expense.getExpenseDate(),
                expense.getStatus(),
                expense.getRejectionReason(),
                expense.getBudget().getId(),
                expense.getBudget().getName(),
                expense.getCreatedAt(),
                expense.getUpdatedAt()
        );
    }
}
