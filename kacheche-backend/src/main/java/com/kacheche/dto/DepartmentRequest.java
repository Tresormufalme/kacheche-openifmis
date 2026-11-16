
package com.kacheche.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DepartmentRequest(

        @NotBlank(message = "Le nom du département est obligatoire.")
        @Size(min = 2, max = 100,
                message = "Le nom doit contenir entre 2 et 100 caractères.")
        String name,

        @NotBlank(message = "Le code du département est obligatoire.")
        @Size(min = 2, max = 20,
                message = "Le code doit contenir entre 2 et 20 caractères.")
        @Pattern(regexp = "^[A-Z0-9_-]+$",
                message = "Le code doit contenir uniquement des majuscules, chiffres, tirets ou underscores.")
        String code,

        @Size(max = 500,
                message = "La description ne peut pas dépasser 500 caractères.")
        String description

) {
}
