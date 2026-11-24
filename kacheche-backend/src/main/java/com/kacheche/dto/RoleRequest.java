package com.kacheche.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record RoleRequest(

        @NotBlank(message = "Le nom du rôle est obligatoire.")
        @Size(min = 2, max = 50,
                message = "Le nom du rôle doit contenir entre 2 et 50 caractères.")
        @Pattern(regexp = "^[A-Za-z][A-Za-z0-9_]*$",
                message = "Le nom du rôle ne peut contenir que des lettres, chiffres et underscores.")
        String name,

        @Size(max = 255, message = "La description ne peut pas dépasser 255 caractères.")
        String description,

        @NotNull(message = "La liste des permissions est obligatoire.")
        Set<String> permissions,

        Long version

) implements VersionedRequest {
}
