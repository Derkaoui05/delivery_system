package com.project.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record FournisseurResponseDTO(
        UUID id,
        String email,
        String raisonSociale,
        String responsable,
        String telephone,
        String adresse,
        String ville,
        boolean active,
        LocalDateTime createdAt
) {
}
