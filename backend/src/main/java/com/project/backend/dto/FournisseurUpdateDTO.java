package com.project.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record FournisseurUpdateDTO(
        @NotBlank String raisonSociale,
        @NotBlank String responsable,
        String adresse,
        @NotBlank String telephone,
        @NotBlank String ville

) {
}
