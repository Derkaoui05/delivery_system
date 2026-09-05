package com.project.backend.dto;

import java.util.UUID;

public record LivreurSummaryDTO(
        UUID id,
        String nom,
        String telephone,
        String ville,
        String disponibilite
) {
}
