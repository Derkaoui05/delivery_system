package com.project.backend.dto;

import java.time.LocalDateTime;

public record StatusHistoryDTO(
        String statut,
        String motifEchec,
        LocalDateTime changeAt
) {
}
