package com.kacheche.security;

/**
 * Politique de mot de passe unique, utilisée par toutes les validations.
 * Minimum 8 caractères, avec au moins une minuscule, une majuscule et un chiffre.
 */
public final class PasswordPolicy {

    public static final String REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,100}$";

    public static final String MESSAGE =
            "Le mot de passe doit contenir 8 caractères minimum, "
                    + "avec une majuscule, une minuscule et un chiffre.";

    private PasswordPolicy() {
    }
}
