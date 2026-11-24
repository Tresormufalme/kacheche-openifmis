package com.kacheche.controller;

import com.kacheche.dto.PermissionResponse;
import com.kacheche.security.Permissions;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Catalogue des permissions disponibles (pour construire l'écran des rôles).
 */
@RestController
@RequestMapping("/api/permissions")
@CrossOrigin(
        origins = {"http://localhost:4200", "http://127.0.0.1:4200"},
        allowCredentials = "true"
)
public class PermissionController {

    @GetMapping
    public ResponseEntity<List<PermissionResponse>> findAll() {
        return ResponseEntity.ok(
                Permissions.all().stream()
                        .map(definition -> new PermissionResponse(
                                definition.code(),
                                definition.group(),
                                definition.description()))
                        .toList());
    }
}
