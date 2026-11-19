package com.kacheche.controller;

import com.kacheche.dto.VersionedRequest;
import com.kacheche.entity.BaseEntity;
import com.kacheche.service.BaseCommand;
import com.kacheche.service.BaseQuery;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur CQRS générique.
 * Les écritures passent par la Command, les lectures par la Query.
 * E = entité, Q = request (commande), S = response, QS = Query, CS = Command.
 */
@CrossOrigin(
        origins = {"http://localhost:4200", "http://127.0.0.1:4200"},
        allowCredentials = "true"
)
public abstract class BaseController<E extends BaseEntity, Q extends VersionedRequest, S,
        QS extends BaseQuery<E, S, ?>, CS extends BaseCommand<E, Q, ?>> {

    protected final QS query;
    protected final CS command;

    protected BaseController(final QS query, final CS command) {
        this.query = query;
        this.command = command;
    }

    @GetMapping
    public ResponseEntity<List<S>> findAll() {
        return ResponseEntity.ok(query.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<S> findById(@PathVariable Long id) {
        return ResponseEntity.ok(query.findById(id));
    }

    @PostMapping
    public ResponseEntity<S> create(@Valid @RequestBody Q request) {
        Long id = command.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(query.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<S> update(@PathVariable Long id, @Valid @RequestBody Q request) {
        command.update(id, request);
        return ResponseEntity.ok(query.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        command.delete(id);
        return ResponseEntity.noContent().build();
    }
}
