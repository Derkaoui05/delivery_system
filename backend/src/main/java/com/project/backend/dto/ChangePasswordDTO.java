package com.project.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for changing password (authenticated user).
 */
public record ChangePasswordDTO(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 8) String newPassword
) {
}
