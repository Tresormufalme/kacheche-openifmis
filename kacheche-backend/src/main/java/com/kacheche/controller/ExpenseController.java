
package com.kacheche.controller;

import com.kacheche.dto.ExpenseRequest;
import com.kacheche.dto.ExpenseResponse;
import com.kacheche.dto.ExpenseRejectionRequest;
import com.kacheche.enums.ExpenseStatus;
import com.kacheche.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(
        origins = {
                "http://localhost:4200",
                "http://127.0.0.1:4200"
        },
        allowCredentials = "true"
)
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    // 1. Afficher toutes les dépenses
    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> findAll() {

        return ResponseEntity.ok(expenseService.findAll());
    }

    // 2. Rechercher une dépense par son identifiant
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> findById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                expenseService.findResponseById(id)
        );
    }

    // 3. Afficher les dépenses d'un budget
    @GetMapping("/budget/{budgetId}")
    public ResponseEntity<List<ExpenseResponse>> findByBudget(
            @PathVariable Long budgetId
    ) {

        return ResponseEntity.ok(
                expenseService.findByBudgetId(budgetId)
        );
    }

    // 4. Filtrer les dépenses par statut
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ExpenseResponse>> findByStatus(
            @PathVariable ExpenseStatus status
    ) {

        return ResponseEntity.ok(
                expenseService.findByStatus(status)
        );
    }

    // 5. Créer une dépense
    @PostMapping
    public ResponseEntity<ExpenseResponse> create(
            @Valid @RequestBody ExpenseRequest request
    ) {

        ExpenseResponse response = expenseService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // 6. Modifier une dépense
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request
    ) {

        return ResponseEntity.ok(
                expenseService.update(id, request)
        );
    }

    // 7. Approuver une dépense
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ExpenseResponse> approve(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                expenseService.approve(id)
        );
    }

    // 8. Rejeter une dépense
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ExpenseResponse> reject(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRejectionRequest request
    ) {

        return ResponseEntity.ok(
                expenseService.reject(id, request.reason())
        );
    }

    // 9. Supprimer une dépense
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        expenseService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
