package com.kacheche.controller;

import com.kacheche.audit.AuditQuery;
import com.kacheche.dto.AuditResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Un seul contrôleur d'audit pour toutes les entités :
 * GET /api/audit/departments/1, /api/audit/budgets/1, /api/audit/expenses/1 ...
 */
@RestController
@RequestMapping("/api/audit")
@CrossOrigin(
        origins = {"http://localhost:4200", "http://127.0.0.1:4200"},
        allowCredentials = "true"
)
public class AuditController {

    private final AuditQuery auditQuery;

    public AuditController(AuditQuery auditQuery) {
        this.auditQuery = auditQuery;
    }

    @GetMapping("/{entity}/{id}")
    public ResponseEntity<List<AuditResponse>> getHistory(
            @PathVariable String entity,
            @PathVariable Long id) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException("L'identifiant doit être positif.");
        }

        return ResponseEntity.ok(auditQuery.getHistory(entity, id));
    }
}
