
package com.kacheche.controller;

import com.kacheche.dto.BudgetAuditResponse;
import com.kacheche.dto.ExpenseAuditResponse;
import com.kacheche.service.AuditService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(
        origins = {"http://localhost:4200", "http://127.0.0.1:4200"},
        allowCredentials = "true"
)
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping("/budgets/{budgetId}")
    public ResponseEntity<List<BudgetAuditResponse>> getBudgetHistory(
            @PathVariable Long budgetId) {

        if (budgetId == null || budgetId <= 0) {
            throw new IllegalArgumentException(
                    "L'identifiant du budget doit être positif."
            );
        }

        return ResponseEntity.ok(
                auditService.getBudgetHistory(budgetId)
        );
    }

    @GetMapping("/expenses/{expenseId}")
    public ResponseEntity<List<ExpenseAuditResponse>> getExpenseHistory(
            @PathVariable Long expenseId) {

        if (expenseId == null || expenseId <= 0) {
            throw new IllegalArgumentException(
                    "L'identifiant de la dépense doit être positif."
            );
        }

        return ResponseEntity.ok(
                auditService.getExpenseHistory(expenseId)
        );
    }
}
