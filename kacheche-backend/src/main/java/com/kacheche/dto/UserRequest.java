package com.kacheche.dto;

import com.kacheche.security.PasswordPolicy;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record UserRequest(

        @NotBlank(message = "Le nom d’utilisateur est obligatoire.")
        @Size(min = 3, max = 50,
                message = "Le nom d’utilisateur doit contenir entre 3 et 50 caractères.")
        @Pattern(regexp = "^[A-Za-z0-9._-]+$",
                message = "Le nom d’utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores.")
        String username,

        @Size(max = 150, message = "Le nom complet ne peut pas dépasser 150 caractères.")
        String fullName,

        @Email(message = "L’adresse e-mail est invalide.")
        @Size(max = 150, message = "L’adresse e-mail ne peut pas dépasser 150 caractères.")
        String email,

        // Obligatoire à la création (vérifié par le service), ignoré à la modification.
        @Pattern(regexp = PasswordPolicy.REGEX, message = PasswordPolicy.MESSAGE)
        String password,

        @NotEmpty(message = "Au moins un rôle est requis.")
        Set<@Positive Long> roleIds,

        Boolean enabled,

        Long version

) implements VersionedRequest {
}
