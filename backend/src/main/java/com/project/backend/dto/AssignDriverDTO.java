package com.project.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AssignDriverDTO(
        @NotNull UUID livreurId
        ) {
}
