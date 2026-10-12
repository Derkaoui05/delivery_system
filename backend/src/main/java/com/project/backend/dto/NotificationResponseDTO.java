package com.project.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponseDTO(
        UUID id,
        String type,
        String message,
        boolean read,
        UUID livraisonId,
        String livraisonReference,
        LocalDateTime createdAt
) {
}
