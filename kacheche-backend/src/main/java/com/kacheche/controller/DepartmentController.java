package com.kacheche.controller;

import com.kacheche.entity.Department;
import com.kacheche.service.DepartmentService;
import com.kacheche.dto.DepartmentRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"}, allowCredentials = "true")
public class DepartmentController {

    private final DepartmentService departmentService;

    // Injection de dépendance
    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    // GET : récupérer tous les départements
    @GetMapping
    public ResponseEntity<List<Department>> findAll() {
        return ResponseEntity.ok(
                departmentService.findAll()
        );
    }

    // GET : récupérer un département par son ID
    @GetMapping("/{id}")
    public ResponseEntity<Department> findById(@PathVariable Long id) {
        return ResponseEntity.ok(
                departmentService.findById(id)
        );
    }

    // POST : créer un département
    @PostMapping
    public ResponseEntity<Department> create(
            @Valid @RequestBody DepartmentRequest request) {

        Department department = new Department(
                request.name(),
                request.code(),
                request.description()
        );

        Department createdDepartment =
                departmentService.create(department);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdDepartment);
    }

    // PUT : modifier un département
    @PutMapping("/{id}")
    public ResponseEntity<Department> update(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest request) {

        Department department = new Department(
                request.name(),
                request.code(),
                request.description()
        );

        return ResponseEntity.ok(
                departmentService.update(id, department)
        );
    }

    // DELETE : supprimer un département
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        departmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}