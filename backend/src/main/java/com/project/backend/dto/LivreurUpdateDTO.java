package com.project.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record LivreurUpdateDTO(
        @NotBlank String nom,
        @NotBlank String telephone,
        String adresse,
        @NotBlank String ville
) {
}
