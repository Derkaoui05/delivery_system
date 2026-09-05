package com.project.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record LivraisonRequestDTO(
        @NotBlank String descriptionColis,
        @Min(1) Integer nombreColis,
        Double poidsApprox,
        String instructions,
        @NotBlank String clientNom,
        @NotBlank String clientTelephone,
        @NotBlank String clientAdresse,
        @NotBlank String clientVille,
        String instructionsLivraison,

        LocalDate dateSouhaiteeRecuperation,
        LocalDate dateSouhaiteeLivraison,
        String commentaire

) {
}
