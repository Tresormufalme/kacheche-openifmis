package com.kacheche.security;

import org.springframework.http.HttpMethod;

/**
 * Les 4 actions CRUD, associées à la méthode HTTP qui les déclenche.
 */
public enum Action {

    READ(HttpMethod.GET, "Consulter"),
    CREATE(HttpMethod.POST, "Créer"),
    UPDATE(HttpMethod.PUT, "Modifier"),
    DELETE(HttpMethod.DELETE, "Supprimer");

    private final HttpMethod httpMethod;
    private final String verb;

    Action(HttpMethod httpMethod, String verb) {
        this.httpMethod = httpMethod;
        this.verb = verb;
    }

    public HttpMethod httpMethod() {
        return httpMethod;
    }

    public String verb() {
        return verb;
    }
}
