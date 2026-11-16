
package com.kacheche.service;

import com.kacheche.dto.DashboardSummaryResponse;
import com.kacheche.dto.DashboardSummaryResponse.DepartmentExecutionDto;
import com.kacheche.dto.DashboardSummaryResponse.ExpenseStatusDto;
import com.kacheche.dto.DashboardSummaryResponse.RecentActivityDto;
import com.kacheche.entity.Budget;
import com.kacheche.entity.Department;
import com.kacheche.entity.Expense;
import com.kacheche.enums.ExpenseStatus;
import com.kacheche.repository.BudgetRepository;
import com.kacheche.repository.DepartmentRepository;
import com.kacheche.repository.ExpenseRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.Year;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final Logger log =
            LoggerFactory.getLogger(DashboardService.class);

    private final DepartmentRepository departmentRepository;
    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public DashboardService(
            DepartmentRepository departmentRepository,
            BudgetRepository budgetRepository,
            ExpenseRepository expenseRepository) {

        this.departmentRepository = departmentRepository;
        this.budgetRepository = budgetRepository;
        this.expenseRepository = expenseRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary() {

        // 1. Récupération des données réelles
        List<Department> departments = departmentRepository.findAll();
        List<Budget> allBudgets = budgetRepository.findAll();
        List<Expense> allExpenses = expenseRepository.findAll();

        long totalDepartments = departments.size();

        // 2. Détermination de l'exercice budgétaire
        int currentYear = Year.now().getValue();

        Integer fiscalYear = allBudgets.stream()
                .map(Budget::getFiscalYear)
                .filter(Objects::nonNull)
                .filter(year -> year == currentYear)
                .findFirst()
                .orElseGet(() -> allBudgets.stream()
                        .map(Budget::getFiscalYear)
                        .filter(Objects::nonNull)
                        .max(Integer::compareTo)
                        .orElse(currentYear));

        // 3. Sélection des budgets de l'exercice
        List<Budget> yearBudgets = allBudgets.stream()
                .filter(b -> Objects.equals(b.getFiscalYear(), fiscalYear))
                .toList();

        // Une seule devise est utilisée pour les totaux affichés.
        String currency = yearBudgets.stream()
                .map(Budget::getCurrency)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse("USD");

        List<Budget> budgets = yearBudgets.stream()
                .filter(b -> currency.equals(b.getCurrency()))
                .toList();

        long totalBudgets = budgets.size();

        // 4. Calcul du budget total
        BigDecimal totalBudgetAmount = budgets.stream()
                .map(Budget::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 5. Identification des budgets concernés
        Set<Long> selectedBudgetIds = budgets.stream()
                .map(Budget::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // 6. Filtrage des dépenses liées à ces budgets
        List<Expense> expenses = allExpenses.stream()
                .filter(expense -> expense.getBudget() != null)
                .filter(expense ->
                        selectedBudgetIds.contains(expense.getBudget().getId()))
                .toList();

        // 7. Comptage des dépenses par statut
        long pending = expenses.stream()
                .filter(e -> e.getStatus() == ExpenseStatus.PENDING)
                .count();

        long approved = expenses.stream()
                .filter(e -> e.getStatus() == ExpenseStatus.APPROVED)
                .count();

        long rejected = expenses.stream()
                .filter(e -> e.getStatus() == ExpenseStatus.REJECTED)
                .count();

        ExpenseStatusDto expenseStatus =
                new ExpenseStatusDto(pending, approved, rejected);

        // 8. Calcul du montant réellement dépensé
        // Seules les dépenses approuvées sont prises en compte.
        BigDecimal totalSpentAmount = expenses.stream()
                .filter(e -> e.getStatus() == ExpenseStatus.APPROVED)
                .map(Expense::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 9. Calcul de l'exécution budgétaire globale
        double overallExecutionRate =
                calculatePercentage(totalSpentAmount, totalBudgetAmount);

        // 10. Regroupement des budgets par département
        Map<Long, BigDecimal> budgetMap = budgets.stream()
                .filter(b -> b.getDepartment() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getDepartment().getId(),
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                Budget::getTotalAmount,
                                BigDecimal::add
                        )
                ));

        // 11. Regroupement des dépenses approuvées par département
        Map<Long, BigDecimal> spentMap = expenses.stream()
                .filter(e -> e.getStatus() == ExpenseStatus.APPROVED)
                .filter(e -> e.getBudget() != null)
                .filter(e -> e.getBudget().getDepartment() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getBudget().getDepartment().getId(),
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                Expense::getAmount,
                                BigDecimal::add
                        )
                ));

        // 12. Construction des indicateurs par département
        List<DepartmentExecutionDto> departmentExecutions =
                departments.stream()
                        .map(department -> {

                            BigDecimal allocated = budgetMap.getOrDefault(
                                    department.getId(),
                                    BigDecimal.ZERO
                            );

                            BigDecimal spent = spentMap.getOrDefault(
                                    department.getId(),
                                    BigDecimal.ZERO
                            );

                            double percentage =
                                    calculatePercentage(spent, allocated);

                            return new DepartmentExecutionDto(
                                    department.getId(),
                                    department.getName(),
                                    allocated,
                                    spent,
                                    percentage
                            );
                        })
                        .toList();

        // 13. Activités récentes provenant de Hibernate Envers
        List<RecentActivityDto> recentActivities =
                fetchRecentActivities();

        // 14. Nombre réel d'opérations auditées
        long totalOperations = countTotalOperations();

        // 15. Retour du tableau de bord
        return new DashboardSummaryResponse(
                totalDepartments,
                totalBudgets,
                totalBudgetAmount,
                currency,
                fiscalYear,
                totalSpentAmount,
                overallExecutionRate,
                totalOperations,
                departmentExecutions,
                recentActivities,
                expenseStatus
        );
    }

    /**
     * Calcule un pourcentage en évitant la division par zéro.
     */
    private double calculatePercentage(
            BigDecimal amount,
            BigDecimal total) {

        if (amount == null || total == null
                || total.compareTo(BigDecimal.ZERO) <= 0) {
            return 0.0;
        }

        double percentage = amount
                .divide(total, 4, RoundingMode.HALF_UP)
                .doubleValue() * 100.0;

        return Math.round(percentage * 10.0) / 10.0;
    }

    /**
     * Récupère les six dernières opérations auditées.
     * Les départements, budgets et dépenses sont inclus.
     */
    private List<RecentActivityDto> fetchRecentActivities() {

        List<RecentActivityDto> activities = new ArrayList<>();

        String sql = """
            SELECT r.rev, r.revtstmp, r.username,
                   'DEPARTMENT' AS entity,
                   d.revtype, d.name AS entity_name, d.id AS entity_id
            FROM revinfo r
            JOIN departments_aud d ON r.rev = d.rev

            UNION ALL

            SELECT r.rev, r.revtstmp, r.username,
                   'BUDGET' AS entity,
                   b.revtype, b.name AS entity_name, b.id AS entity_id
            FROM revinfo r
            JOIN budgets_aud b ON r.rev = b.rev

            UNION ALL

            SELECT r.rev, r.revtstmp, r.username,
                   'EXPENSE' AS entity,
                   e.revtype, e.description AS entity_name,
                   e.id AS entity_id
            FROM revinfo r
            JOIN expenses_aud e ON r.rev = e.rev

            ORDER BY revtstmp DESC, rev DESC
            LIMIT 6
            """;

        try {
            Query query = entityManager.createNativeQuery(sql);

            @SuppressWarnings("unchecked")
            List<Object[]> rows = query.getResultList();

            for (Object[] row : rows) {

                Long revision = ((Number) row[0]).longValue();
                Long timestamp = ((Number) row[1]).longValue();

                String username = (String) row[2];
                String entity = (String) row[3];

                int revisionType = ((Number) row[4]).intValue();

                String entityName = (String) row[5];
                Long entityId = ((Number) row[6]).longValue();

                String title;
                String icon;
                String color;

                String entityLabel = switch (entity) {
                    case "DEPARTMENT" -> "Département";
                    case "BUDGET" -> "Budget";
                    case "EXPENSE" -> "Dépense";
                    default -> "Opération";
                };

                switch (revisionType) {
                    case 0 -> {
                        title = "Création : " + entityLabel;
                        icon = "add_circle";
                        color = "green";
                    }
                    case 1 -> {
                        title = "Modification : " + entityLabel;
                        icon = "edit";
                        color = "orange";
                    }
                    case 2 -> {
                        title = "Suppression : " + entityLabel;
                        icon = "delete";
                        color = "red";
                    }
                    default -> {
                        title = "Opération : " + entityLabel;
                        icon = "history";
                        color = "blue";
                    }
                }

                String user = username != null && !username.isBlank()
                        ? username
                        : "Utilisateur inconnu";

                String description = entityName != null
                        ? entityName
                        : entityLabel + " #" + entityId;

                Instant instant = Instant.ofEpochMilli(timestamp);

                activities.add(new RecentActivityDto(
                        revision,
                        title,
                        description,
                        user,
                        formatRelativeTime(timestamp),
                        icon,
                        color,
                        instant.toString()
                ));
            }

        } catch (Exception e) {
            log.error(
                    "Impossible de récupérer les activités récentes depuis Envers",
                    e
            );
        }

        return activities;
    }

    /**
     * Compte les opérations enregistrées dans les tables d'audit.
     * Une ligne d'une table *_aud représente une opération sur une entité.
     */
    private long countTotalOperations() {

        String sql = """
            SELECT
                (SELECT COUNT(*) FROM departments_aud)
                +
                (SELECT COUNT(*) FROM budgets_aud)
                +
                (SELECT COUNT(*) FROM expenses_aud)
            """;

        try {
            Query query = entityManager.createNativeQuery(sql);

            return ((Number) query.getSingleResult()).longValue();

        } catch (Exception e) {
            log.error("Impossible de compter les opérations auditées", e);
            return 0;
        }
    }

    /**
     * Convertit une date en temps relatif.
     */
    private String formatRelativeTime(Long epochMilli) {

        if (epochMilli == null) {
            return "Récemment";
        }

        Instant instant = Instant.ofEpochMilli(epochMilli);

        Duration duration = Duration.between(
                instant,
                Instant.now()
        );

        long minutes = duration.toMinutes();

        if (minutes < 1) {
            return "À l'instant";
        }

        if (minutes < 60) {
            return "Il y a " + minutes + " min";
        }

        long hours = duration.toHours();

        if (hours < 24) {
            return "Il y a " + hours + " h";
        }

        long days = duration.toDays();

        if (days < 7) {
            return "Il y a " + days + " j";
        }

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                        .withZone(ZoneId.systemDefault());

        return formatter.format(instant);
    }
}
