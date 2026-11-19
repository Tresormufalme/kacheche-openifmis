package com.kacheche.service;

import com.kacheche.entity.BaseEntity;
import com.kacheche.exception.ResourceNotFoundException;
import com.kacheche.repository.BaseRepository;
import org.springframework.core.GenericTypeResolver;

/**
 * Socle commun aux côtés Query et Command : repository + chargement par id.
 */
public abstract class BaseHandler<E extends BaseEntity, R extends BaseRepository<E>> {

    protected final R repository;
    private final String label;

    protected BaseHandler(final R repository, final String label) {
        this.repository = repository;
        this.label = label != null ? label : resolveEntityName();
    }

    protected E getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        label + " introuvable avec l'identifiant : " + id));
    }

    private String resolveEntityName() {
        Class<?>[] types = GenericTypeResolver.resolveTypeArguments(getClass(), BaseHandler.class);
        return types != null ? types[0].getSimpleName() : "Ressource";
    }
}
