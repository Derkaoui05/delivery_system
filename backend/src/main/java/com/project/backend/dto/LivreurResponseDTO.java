package com.project.backend.dto;


import java.util.UUID;

public record LivreurResponseDTO(
        UUID id,
        String email,
        String nom,
        String telephone,
        String adresse,
        String ville,
        String disponibilite,
        boolean active
) {
}
