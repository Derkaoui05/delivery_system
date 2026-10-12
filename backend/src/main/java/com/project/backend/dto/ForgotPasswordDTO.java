package com.project.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for password reset initiation.
 */
public record ForgotPasswordDTO(
        @NotBlank @Email String email
) {
}
