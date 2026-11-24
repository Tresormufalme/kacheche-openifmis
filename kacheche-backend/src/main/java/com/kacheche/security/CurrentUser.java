package com.kacheche.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Accès à l'utilisateur de la requête en cours.
 */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static Optional<AppUserDetails> get() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null
                && authentication.getPrincipal() instanceof AppUserDetails user) {
            return Optional.of(user);
        }

        return Optional.empty();
    }

    public static boolean isUsername(String username) {
        return get()
                .map(user -> user.getUsername().equalsIgnoreCase(username))
                .orElse(false);
    }
}
