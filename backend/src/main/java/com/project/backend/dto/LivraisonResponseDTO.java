package com.project.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record LivraisonResponseDTO(
        UUID id,
        String reference,
        String status,
        String fournisseurNom,
        String livreurNom,
        String clientNom,
        String clientVille,
        String descriptionColis,
        LocalDate dateShouhaiteeRescuperation,
        LocalDate dateSouhaiteeLivraison,
        LocalDateTime createdAt
) {
}
