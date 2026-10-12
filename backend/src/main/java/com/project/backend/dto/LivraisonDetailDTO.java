package com.project.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Detailed view of a livraison, including full status history.
 * Used by GET /livraisons/{id} endpoints.
 */
public record LivraisonDetailDTO(
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
        LocalDateTime createdAt,
        // Status history
        List<StatusHistoryDTO> statusHistory
) {
}
