package com.kacheche.dto;

import com.fasterxml.jackson.annotation.JsonAnyGetter;

import java.time.Instant;
import java.util.Map;

/**
 * Réponse d'audit unique pour toutes les entités.
 * Les champs métier de l'entité sont aplatis au même niveau dans le JSON.
 */
public class AuditResponse {

    private final Long entityId;
    private final Integer revision;
    private final String operation;
    private final Instant revisionDate;
    private final String username;
    private final Map<String, Object> data;

    public AuditResponse(Long entityId, Integer revision, String operation,
                         Instant revisionDate, String username,
                         Map<String, Object> data) {
        this.entityId = entityId;
        this.revision = revision;
        this.operation = operation;
        this.revisionDate = revisionDate;
        this.username = username;
        this.data = data;
    }

    public Long getEntityId() { return entityId; }
    public Integer getRevision() { return revision; }
    public String getOperation() { return operation; }
    public Instant getRevisionDate() { return revisionDate; }
    public String getUsername() { return username; }

    @JsonAnyGetter
    public Map<String, Object> getData() { return data; }
}
