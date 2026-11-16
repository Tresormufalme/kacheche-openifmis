
package com.kacheche.controller;

import com.kacheche.dto.BudgetRequest;
import com.kacheche.dto.BudgetResponse;
import com.kacheche.entity.Budget;
import com.kacheche.entity.Department;
import com.kacheche.service.BudgetService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(
        origins = {"http://localhost:4200", "http://127.0.0.1:4200"},
        allowCredentials = "true"
)
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    // ==========================================
    // GET ALL
    // ==========================================

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> findAll() {

        return ResponseEntity.ok(
                budgetService.findAllResponses()
        );
    }

    // ==========================================
    // GET BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponse> findById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                budgetService.findResponseById(id)
        );
    }

    // ==========================================
    // CREATE
    // ==========================================

    @PostMapping
    public ResponseEntity<BudgetResponse> create(
            @Valid @RequestBody BudgetRequest request) {

        Budget budget = mapToEntity(request);

        BudgetResponse response =
                budgetService.createResponse(budget);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ==========================================
    // UPDATE
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request) {

        Budget budget = mapToEntity(request);

        return ResponseEntity.ok(
                budgetService.updateResponse(id, budget)
        );
    }

    // ==========================================
    // DELETE
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        budgetService.delete(id);

        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // FILTER BY FISCAL YEAR
    // ==========================================

    @GetMapping("/year/{year}")
    public ResponseEntity<List<BudgetResponse>> findByFiscalYear(
            @PathVariable Integer year) {

        return ResponseEntity.ok(
                budgetService.findResponsesByFiscalYear(year)
        );
    }

    // ==========================================
    // FILTER BY DEPARTMENT
    // ==========================================

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<BudgetResponse>> findByDepartment(
            @PathVariable Long departmentId) {

        return ResponseEntity.ok(
                budgetService.findResponsesByDepartment(departmentId)
        );
    }

    // ==========================================
    // REQUEST -> ENTITY
    // ==========================================

    private Budget mapToEntity(BudgetRequest request) {

        Department department =
                new Department(request.departmentId());

        return new Budget(
                request.name(),
                request.fiscalYear(),
                request.totalAmount(),
                request.currency(),
                department
        );
    }
}
