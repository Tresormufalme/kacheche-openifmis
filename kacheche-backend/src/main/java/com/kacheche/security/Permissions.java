package com.kacheche.security;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Catalogue unique de toutes les permissions de l'application.
 * Source de vérité : les rôles (en base) ne peuvent contenir que ces codes.
 */
public final class Permissions {

    // Permissions "métier" qui ne suivent pas le schéma CRUD
    public static final String DASHBOARD_READ = "DASHBOARD_READ";
    public static final String AUDIT_READ = "AUDIT_READ";
    public static final String EXPENSE_APPROVE = "EXPENSE_APPROVE";
    public static final String EXPENSE_REJECT = "EXPENSE_REJECT";
    public static final String USER_RESET_PASSWORD = "USER_RESET_PASSWORD";

    private static final List<PermissionDefinition> CATALOG = buildCatalog();

    private static final Set<String> CODES = CATALOG.stream()
            .map(PermissionDefinition::code)
            .collect(Collectors.toCollection(LinkedHashSet::new));

    private Permissions() {
    }

    public static List<PermissionDefinition> all() {
        return CATALOG;
    }

    public static Set<String> codes() {
        return CODES;
    }

    public static boolean isValid(String code) {
        return CODES.contains(code);
    }

    private static List<PermissionDefinition> buildCatalog() {

        List<PermissionDefinition> list = new ArrayList<>();

        list.add(new PermissionDefinition(
                DASHBOARD_READ, "Tableau de bord", "Consulter le tableau de bord"));

        for (Resource resource : Resource.values()) {
            for (Action action : Action.values()) {
                list.add(new PermissionDefinition(
                        resource.permission(action),
                        resource.title(),
                        action.verb() + " " + resource.noun()
                ));
            }
        }

        list.add(new PermissionDefinition(
                EXPENSE_APPROVE, Resource.EXPENSE.title(), "Approuver les dépenses"));
        list.add(new PermissionDefinition(
                EXPENSE_REJECT, Resource.EXPENSE.title(), "Rejeter les dépenses"));
        list.add(new PermissionDefinition(
                USER_RESET_PASSWORD, Resource.USER.title(),
                "Réinitialiser le mot de passe d’un utilisateur"));
        list.add(new PermissionDefinition(
                AUDIT_READ, "Audit", "Consulter l’audit trail"));

        return List.copyOf(list);
    }
}
