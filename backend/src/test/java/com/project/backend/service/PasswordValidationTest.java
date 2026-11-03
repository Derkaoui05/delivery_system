package com.project.backend.service;

import com.project.backend.dto.ChangePasswordDTO;
import com.project.backend.dto.RegisterFournisseurDTO;
import com.project.backend.dto.RegisterLivreurDTO;
import com.project.backend.dto.ResetPasswordDTO;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Validation: Mot de passe de moins de 8 caractères rejeté sur RegisterFournisseurDTO")
    void testRegisterFournisseurShortPassword() {
        RegisterFournisseurDTO dto = new RegisterFournisseurDTO(
                "fournisseur@test.com",
                "short", // 5 chars < 8
                "Société Express",
                "Karim",
                "0612345678",
                "Adresse",
                "Casablanca"
        );
        Set<ConstraintViolation<RegisterFournisseurDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty(), "Un mot de passe court doit générer une violation de validation");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
    }

    @Test
    @DisplayName("Validation: Mot de passe valide (>= 8 car) accepté sur RegisterFournisseurDTO")
    void testRegisterFournisseurValidPassword() {
        RegisterFournisseurDTO dto = new RegisterFournisseurDTO(
                "fournisseur@test.com",
                "Password123!",
                "Société Express",
                "Karim",
                "0612345678",
                "Adresse",
                "Casablanca"
        );
        Set<ConstraintViolation<RegisterFournisseurDTO>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }

    @Test
    @DisplayName("Validation: Mot de passe trop court rejeté sur RegisterLivreurDTO")
    void testRegisterLivreurShortPassword() {
        RegisterLivreurDTO dto = new RegisterLivreurDTO(
                "livreur@test.com",
                "1234567", // 7 chars < 8
                "Youssef",
                "0612345678",
                "Maarif",
                "Casablanca"
        );
        Set<ConstraintViolation<RegisterLivreurDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
    }

    @Test
    @DisplayName("Validation: Mot de passe trop court rejeté sur ChangePasswordDTO")
    void testChangePasswordShortPassword() {
        ChangePasswordDTO dto = new ChangePasswordDTO("OldPassword123!", "short");
        Set<ConstraintViolation<ChangePasswordDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("newPassword")));
    }

    @Test
    @DisplayName("Validation: Mot de passe trop court rejeté sur ResetPasswordDTO")
    void testResetPasswordShortPassword() {
        ResetPasswordDTO dto = new ResetPasswordDTO("valid-token", "1234");
        Set<ConstraintViolation<ResetPasswordDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("newPassword")));
    }
}

