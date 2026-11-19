package com.kacheche.service;

import com.kacheche.entity.BaseEntity;
import com.kacheche.mapper.EntityMapper;
import com.kacheche.repository.BaseRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * CQRS - côté LECTURE.
 * Ne modifie jamais l'état, retourne uniquement des DTO (S).
 * Le mapping se fait dans la transaction : plus de LazyInitializationException.
 */
@Transactional(readOnly = true)
public abstract class BaseQuery<E extends BaseEntity, S, R extends BaseRepository<E>>
        extends BaseHandler<E, R> {

    protected final EntityMapper<E, ?, S> mapper;

    protected BaseQuery(final R repository, final EntityMapper<E, ?, S> mapper) {
        this(repository, mapper, null);
    }

    protected BaseQuery(final R repository, final EntityMapper<E, ?, S> mapper, final String label) {
        super(repository, label);
        this.mapper = mapper;
    }

    public S findById(Long id) {
        return mapper.toResponse(getOrThrow(id));
    }

    public List<S> findAll() {
        return toResponses(repository.findAll());
    }

    protected List<S> toResponses(List<E> entities) {
        return entities.stream().map(mapper::toResponse).toList();
    }
}
