package com.project.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record LivraisonResponseDTO(
        UUID id,
        String reference,
        String status,
        // Fournisseur (Point A) info
        String fournisseurNom,
        String fournisseurTelephone,
        String fournisseurAdresse,
        String fournisseurVille,
        // Livreur info
        String livreurNom,
        String livreurTelephone,
        // Client (Point B) info
        String clientNom,
        String clientTelephone,
        String clientAdresse,
        String clientVille,
        // Colis info
        String descriptionColis,
        Integer nombreColis,
        Double poidsApprox,
        String instructions,
        String instructionsLivraison,
        String commentaire,
        // Dates
        LocalDate dateSouhaiteeRecuperation,
        LocalDate dateSouhaiteeLivraison,
        LocalDateTime createdAt
) {
}
