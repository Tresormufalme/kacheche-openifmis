package com.kacheche.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ExpenseRejectionRequest(

        @NotBlank(message = "Le motif du rejet est obligatoire")
        @Size(max = 500, message = "Le motif ne peut pas dépasser 500 caractères")
        String reason,

        /** Optionnelle : si fournie, le rejet échoue si la dépense a changé entre-temps. */
        Long version

) {}
