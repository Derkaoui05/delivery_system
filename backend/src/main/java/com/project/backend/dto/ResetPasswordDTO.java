package com.project.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for resetting password using a token.
 */
public record ResetPasswordDTO(
        @NotBlank String token,
        @NotBlank @Size(min = 8) String newPassword
) {
}
