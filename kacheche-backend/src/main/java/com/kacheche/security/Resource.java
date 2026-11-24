package com.kacheche.security;

/**
 * Ressources métier protégées par le RBAC.
 *
 * Pour une NOUVELLE entité : ajouter une ligne ici suffit.
 * Les permissions XXX_READ / XXX_CREATE / XXX_UPDATE / XXX_DELETE
 * et les règles d'accès HTTP sont générées automatiquement.
 */
public enum Resource {

    DEPARTMENT("departments", "Départements", "les départements"),
    BUDGET("budgets", "Budgets", "les budgets"),
    EXPENSE("expenses", "Dépenses", "les dépenses"),
    USER("users", "Utilisateurs", "les utilisateurs"),
    ROLE("roles", "Rôles", "les rôles");

    private final String path;
    private final String title;
    private final String noun;

    Resource(String path, String title, String noun) {
        this.path = path;
        this.title = title;
        this.noun = noun;
    }

    public String title() {
        return title;
    }

    public String noun() {
        return noun;
    }

    // "/api/departments/**"
    public String apiPattern() {
        return "/api/" + path + "/**";
    }

    // "DEPARTMENT_READ"
    public String permission(Action action) {
        return name() + "_" + action.name();
    }
}
