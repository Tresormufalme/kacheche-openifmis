package com.kacheche.service;

import com.kacheche.dto.VersionedRequest;
import com.kacheche.entity.BaseEntity;
import com.kacheche.mapper.EntityMapper;
import com.kacheche.repository.BaseRepository;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.transaction.annotation.Transactional;

/**
 * CQRS - côté ÉCRITURE.
 * Une commande modifie l'état et ne retourne rien (ou juste l'id créé) :
 * la relecture passe par le côté Query.
 * Optimistic locking : la version envoyée par le client doit être celle en base.
 * Les règles métier se placent dans les hooks, jamais dans le CRUD.
 */
@Transactional
public abstract class BaseCommand<E extends BaseEntity, Q extends VersionedRequest,
        R extends BaseRepository<E>> extends BaseHandler<E, R> {

    protected final EntityMapper<E, Q, ?> mapper;

    protected BaseCommand(final R repository, final EntityMapper<E, Q, ?> mapper) {
        this(repository, mapper, null);
    }

    protected BaseCommand(final R repository, final EntityMapper<E, Q, ?> mapper, final String label) {
        super(repository, label);
        this.mapper = mapper;
    }

    public Long create(Q request) {
        E entity = mapper.toEntity(request);
        prepare(entity);
        validateCreate(entity);
        return repository.save(entity).getId();
    }

    public void update(Long id, Q request) {
        if (request.version() == null) {
            throw new IllegalArgumentException("La version est obligatoire pour une modification.");
        }

        E existing = getOrThrow(id);
        checkVersion(existing, request.version());

        E incoming = mapper.toEntity(request);
        prepare(incoming);
        validateUpdate(existing, incoming);
        copy(existing, incoming);

        repository.saveAndFlush(existing);
    }

    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    /** Refuse l'opération si l'entité a changé depuis la lecture du client. */
    protected void checkVersion(E existing, Long clientVersion) {
        if (clientVersion != null && !clientVersion.equals(existing.getVersion())) {
            throw new ObjectOptimisticLockingFailureException(existing.getClass(), existing.getId());
        }
    }

    // ---------- HOOKS ----------

    protected void prepare(E entity) {
    }

    protected void validateCreate(E entity) {
    }

    protected void validateUpdate(E existing, E incoming) {
    }

    protected abstract void copy(E target, E source);
}
