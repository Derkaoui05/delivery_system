package com.project.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterFournisseurDTO(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String password,
        @NotBlank String raisonSociale,
        @NotBlank String responsable,
        @NotBlank String telephone,
        String adresse,
        @NotBlank String ville
) {
}
