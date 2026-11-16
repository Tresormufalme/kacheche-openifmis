
package com.kacheche.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ExpenseRejectionRequest(

        @NotBlank(message = "Le motif du rejet est obligatoire")
        @Size(max = 500, message = "Le motif ne peut pas dépasser 500 caractères")
        String reason

) {}
