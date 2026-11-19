package com.kacheche.controller;

import com.kacheche.dto.BudgetRequest;
import com.kacheche.dto.BudgetResponse;
import com.kacheche.entity.Budget;
import com.kacheche.service.BudgetCommand;
import com.kacheche.service.BudgetQuery;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController extends BaseController<
        Budget, BudgetRequest, BudgetResponse, BudgetQuery, BudgetCommand> {

    public BudgetController(BudgetQuery query, BudgetCommand command) {
        super(query, command);
    }

    @GetMapping("/year/{year}")
    public ResponseEntity<List<BudgetResponse>> findByFiscalYear(@PathVariable Integer year) {
        return ResponseEntity.ok(query.findByFiscalYear(year));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<BudgetResponse>> findByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(query.findByDepartmentId(departmentId));
    }
}
