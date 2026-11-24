package com.kacheche.audit;

import com.kacheche.dto.AuditResponse;
import com.kacheche.entity.BaseEntity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.metamodel.Attribute;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.PluralAttribute;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.NotAudited;
import org.hibernate.envers.RevisionType;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Field;
import java.lang.reflect.Member;
import java.lang.reflect.Method;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Historique Envers pour N'IMPORTE QUELLE entité @Audited.
 * Aucune classe à créer par entité : le snapshot est lu via le métamodèle JPA.
 *
 *  - une relation vers une entité devient "<nom>Id"
 *  - une collection devient une liste triée (identifiants ou valeurs)
 *  - un champ @NotAudited (ex. mot de passe) n'apparaît jamais
 */
@Service
@Transactional(readOnly = true)
public class AuditQuery {

    private static final Set<String> IGNORED = Set.of("id", "version");

    @PersistenceContext
    private EntityManager entityManager;

    private final AuditRegistry registry;

    public AuditQuery(AuditRegistry registry) {
        this.registry = registry;
    }

    @SuppressWarnings("unchecked")
    public List<AuditResponse> getHistory(String entityKey, Long id) {
        Class<?> entityClass = registry.resolve(entityKey);

        AuditReader reader = AuditReaderFactory.get(entityManager);

        List<Object[]> revisions = reader.createQuery()
                .forRevisionsOfEntity(entityClass, false, true)
                .add(AuditEntity.id().eq(id))
                .addOrder(AuditEntity.revisionNumber().asc())
                .getResultList();

        return revisions.stream()
                .map(row -> {
                    RevisionInfo revision = (RevisionInfo) row[1];
                    RevisionType type = (RevisionType) row[2];

                    return new AuditResponse(
                            id,
                            revision.getId(),
                            type.name(),
                            Instant.ofEpochMilli(revision.getTimestamp()),
                            revision.getUsername(),
                            snapshot(row[0], entityClass)
                    );
                })
                .toList();
    }

    private Map<String, Object> snapshot(Object entity, Class<?> entityClass) {
        Map<String, Object> data = new LinkedHashMap<>();

        EntityType<?> type = entityManager.getMetamodel().entity(entityClass);

        for (Attribute<?, ?> attribute : type.getSingularAttributes()) {

            String name = attribute.getName();

            if (IGNORED.contains(name) || isNotAudited(attribute)) {
                continue;
            }

            Object value = entity == null ? null : read(entity, attribute);

            if (value instanceof BaseEntity reference) {
                data.put(name + "Id", reference.getId());
            } else {
                data.put(name, value);
            }
        }

        for (PluralAttribute<?, ?, ?> attribute : type.getPluralAttributes()) {

            if (isNotAudited(attribute)) {
                continue;
            }

            Object value = entity == null ? null : read(entity, attribute);

            data.put(attribute.getName(), describeCollection(value));
        }

        return data;
    }

    private boolean isNotAudited(Attribute<?, ?> attribute) {
        Member member = attribute.getJavaMember();

        return member instanceof AnnotatedElement element
                && element.isAnnotationPresent(NotAudited.class);
    }

    private Object read(Object entity, Attribute<?, ?> attribute) {
        Member member = attribute.getJavaMember();
        try {
            if (member instanceof Field field) {
                field.setAccessible(true);
                return field.get(entity);
            }
            if (member instanceof Method method) {
                method.setAccessible(true);
                return method.invoke(entity);
            }
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(
                    "Lecture impossible de " + attribute.getName(), e);
        }
        return null;
    }

    // Collection -> liste triée (identifiants pour des entités, texte sinon).
    private Object describeCollection(Object value) {

        if (!(value instanceof Collection<?> collection)) {
            return null;
        }

        try {
            List<Object> items = new ArrayList<>();

            for (Object element : collection) {
                items.add(element instanceof BaseEntity reference
                        ? reference.getId()
                        : String.valueOf(element));
            }

            items.sort((a, b) -> {
                if (a instanceof Number x && b instanceof Number y) {
                    return Long.compare(x.longValue(), y.longValue());
                }
                return String.valueOf(a).compareTo(String.valueOf(b));
            });

            return items;

        } catch (RuntimeException e) {
            // Collection non chargeable (ex. entité supprimée) : on n'affiche rien.
            return null;
        }
    }
}
