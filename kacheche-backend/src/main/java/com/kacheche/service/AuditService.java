
package com.kacheche.service;

import com.kacheche.dto.BudgetAuditResponse;
import com.kacheche.dto.ExpenseAuditResponse;
import com.kacheche.entity.Budget;
import com.kacheche.entity.Expense;
import com.kacheche.audit.RevisionInfo;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.RevisionType;
import org.hibernate.envers.query.AuditEntity;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class AuditService {

    @PersistenceContext
    private EntityManager entityManager;

    @SuppressWarnings("unchecked")
    @Transactional(readOnly = true)
    public List<BudgetAuditResponse> getBudgetHistory(Long budgetId) {

        AuditReader reader =
                AuditReaderFactory.get(entityManager);

        List<Object[]> revisions = reader.createQuery()
                .forRevisionsOfEntity(Budget.class, false, true)
                .add(AuditEntity.id().eq(budgetId))
                .addOrder(AuditEntity.revisionNumber().asc())
                .getResultList();

        List<BudgetAuditResponse> history = new ArrayList<>();

        for (Object[] revisionData : revisions) {

            Budget budget = (Budget) revisionData[0];

            RevisionInfo revisionInfo =
                    (RevisionInfo) revisionData[1];

            RevisionType revisionType =
                    (RevisionType) revisionData[2];

            Long id = budget != null
                    ? budget.getId()
                    : budgetId;

            String name = budget != null
                    ? budget.getName()
                    : null;

            Integer fiscalYear = budget != null
                    ? budget.getFiscalYear()
                    : null;

            var amount = budget != null
                    ? budget.getTotalAmount()
                    : null;

            String currency = budget != null
                    ? budget.getCurrency()
                    : null;

            Long departmentId =
                    budget != null && budget.getDepartment() != null
                            ? budget.getDepartment().getId()
                            : null;

            BudgetAuditResponse response =
                    new BudgetAuditResponse(
                            id,
                            revisionInfo.getId(),
                            revisionType.name(),
                            Instant.ofEpochMilli(
                                    revisionInfo.getTimestamp()
                            ),
                            revisionInfo.getUsername(),
                            name,
                            fiscalYear,
                            amount,
                            currency,
                            departmentId
                    );

            history.add(response);
        }

        return history;
    }

    // HISTORIQUE DES DEPENSES
    @SuppressWarnings("unchecked")
    @Transactional(readOnly = true)
    public List<ExpenseAuditResponse> getExpenseHistory(Long expenseId) {

        AuditReader reader =
                AuditReaderFactory.get(entityManager);

        List<Object[]> revisions = reader.createQuery()
                .forRevisionsOfEntity(Expense.class, false, true)
                .add(AuditEntity.id().eq(expenseId))
                .addOrder(AuditEntity.revisionNumber().asc())
                .getResultList();

        List<ExpenseAuditResponse> history = new ArrayList<>();

        for (Object[] revisionData : revisions) {

            Expense expense = (Expense) revisionData[0];

            RevisionInfo revisionInfo =
                    (RevisionInfo) revisionData[1];

            RevisionType revisionType =
                    (RevisionType) revisionData[2];

            Long id = expense != null
                    ? expense.getId()
                    : expenseId;

            String description = expense != null
                    ? expense.getDescription()
                    : null;

            var amount = expense != null
                    ? expense.getAmount()
                    : null;

            var expenseDate = expense != null
                    ? expense.getExpenseDate()
                    : null;

            String status = expense != null
                    && expense.getStatus() != null
                    ? expense.getStatus().name()
                    : null;

            String rejectionReason = expense != null
                    ? expense.getRejectionReason()
                    : null;

            Long budgetId = expense != null
                    && expense.getBudget() != null
                    ? expense.getBudget().getId()
                    : null;

            String budgetName = expense != null
                    && expense.getBudget() != null
                    ? expense.getBudget().getName()
                    : null;

            ExpenseAuditResponse response =
                    new ExpenseAuditResponse(
                            id,
                            revisionInfo.getId(),
                            revisionType.name(),
                            Instant.ofEpochMilli(
                                    revisionInfo.getTimestamp()
                            ),
                            revisionInfo.getUsername(),
                            description,
                            amount,
                            expenseDate,
                            status,
                            rejectionReason,
                            budgetId,
                            budgetName
                    );

            history.add(response);
        }

        return history;
    }
}
