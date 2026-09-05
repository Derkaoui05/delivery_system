package com.project.backend.dto;

import java.util.UUID;

public record LoginResponseDTO(
        String token,
        String role,
        UUID userId
) {
}
