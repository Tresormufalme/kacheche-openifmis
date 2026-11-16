
package com.kacheche.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(

        @NotBlank(message = "La description est obligatoire")
        @Size(min = 3, max = 150,
                message = "La description doit contenir entre 3 et 150 caractères")
        String description,

        @NotNull(message = "Le montant est obligatoire")
        @DecimalMin(value = "0.01",
                message = "Le montant doit être supérieur à zéro")
        @Digits(integer = 17, fraction = 2,
                message = "Le montant ne peut avoir que deux décimales")
        BigDecimal amount,

        @NotNull(message = "La date de la dépense est obligatoire")
        LocalDate expenseDate,

        @NotNull(message = "Le budget est obligatoire")
        @Positive(message = "L'identifiant du budget doit être positif")
        Long budgetId

) {}
