package com.kacheche.audit;

import com.kacheche.exception.ResourceNotFoundException;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Table;
import jakarta.persistence.metamodel.EntityType;
import org.hibernate.envers.Audited;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.TreeMap;

/**
 * Découvre automatiquement toutes les entités @Audited au démarrage.
 * Clé d'accès = nom de table (@Table), ex : "departments", "budgets", "expenses".
 * Une nouvelle entité @Audited + @Table est auditable sans écrire une ligne de plus.
 */
@Component
public class AuditRegistry {

    private final Map<String, Class<?>> entities = new TreeMap<>();

    public AuditRegistry(EntityManagerFactory entityManagerFactory) {
        for (EntityType<?> type : entityManagerFactory.getMetamodel().getEntities()) {
            Class<?> entityClass = type.getJavaType();

            if (!entityClass.isAnnotationPresent(Audited.class)) {
                continue;
            }

            Table table = entityClass.getAnnotation(Table.class);
            String key = table != null && !table.name().isBlank()
                    ? table.name()
                    : entityClass.getSimpleName().toLowerCase() + "s";

            entities.put(key, entityClass);
        }
    }

    public Class<?> resolve(String key) {
        Class<?> entityClass = entities.get(key);
        if (entityClass == null) {
            throw new ResourceNotFoundException(
                    "Entité auditée inconnue : " + key + ". Disponibles : " + entities.keySet());
        }
        return entityClass;
    }
}
