
package com.kacheche.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record BudgetRequest(

        @NotBlank(message = "Le nom du budget est obligatoire.")
        @Size(min = 2, max = 150,
                message = "Le nom doit contenir entre 2 et 150 caractères.")
        String name,

        @NotNull(message = "L'année budgétaire est obligatoire.")
        @Min(value = 2000, message = "L'année doit être supérieure ou égale à 2000.")
        @Max(value = 2100, message = "L'année doit être inférieure ou égale à 2100.")
        Integer fiscalYear,

        @NotNull(message = "Le montant est obligatoire.")
        @DecimalMin(value = "0.01",
                message = "Le montant doit être supérieur à zéro.")
        @Digits(integer = 17, fraction = 2,
                message = "Le montant doit contenir au maximum 17 chiffres entiers et 2 décimales.")
        BigDecimal totalAmount,

        @NotBlank(message = "La devise est obligatoire.")
        @Pattern(regexp = "USD|CDF",
                message = "La devise doit être USD ou CDF.")
        String currency,

        @NotNull(message = "Le département est obligatoire.")
        @Positive(message = "L'identifiant du département doit être positif.")
        Long departmentId

) {}
