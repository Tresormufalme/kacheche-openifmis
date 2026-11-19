package com.kacheche.controller;

import com.kacheche.dto.ExpenseRejectionRequest;
import com.kacheche.dto.ExpenseRequest;
import com.kacheche.dto.ExpenseResponse;
import com.kacheche.entity.Expense;
import com.kacheche.enums.ExpenseStatus;
import com.kacheche.service.ExpenseCommand;
import com.kacheche.service.ExpenseQuery;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController extends BaseController<
        Expense, ExpenseRequest, ExpenseResponse, ExpenseQuery, ExpenseCommand> {

    public ExpenseController(ExpenseQuery query, ExpenseCommand command) {
        super(query, command);
    }

    @GetMapping("/budget/{budgetId}")
    public ResponseEntity<List<ExpenseResponse>> findByBudget(@PathVariable Long budgetId) {
        return ResponseEntity.ok(query.findByBudgetId(budgetId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ExpenseResponse>> findByStatus(@PathVariable ExpenseStatus status) {
        return ResponseEntity.ok(query.findByStatus(status));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ExpenseResponse> approve(
            @PathVariable Long id,
            @RequestParam(required = false) Long version) {
        command.approve(id, version);
        return ResponseEntity.ok(query.findById(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ExpenseResponse> reject(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRejectionRequest request) {
        command.reject(id, request.reason(), request.version());
        return ResponseEntity.ok(query.findById(id));
    }
}
