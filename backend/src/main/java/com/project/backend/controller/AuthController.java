package com.project.backend.controller;

import com.project.backend.config.CurrentUserProvider;
import com.project.backend.dto.*;
import com.project.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final CurrentUserProvider currentUser;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto){
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("/register-fournisseur")
    public ResponseEntity<Void> registerFournisseur(@Valid @RequestBody RegisterFournisseurDTO dto){
        authService.registerFournisseur(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/register-livreur")
    public ResponseEntity<Void> registerLivreur(@Valid @RequestBody RegisterLivreurDTO dto){
        authService.registerLivreur(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordDTO dto) {
        String token = authService.forgotPassword(dto);
        return ResponseEntity.ok(Map.of(
                "message", "Un lien de réinitialisation a été généré",
                "resetToken", token
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordDTO dto) {
        authService.resetPassword(dto);
        return ResponseEntity.ok(Map.of("message", "Mot de passe réinitialisé avec succès"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordDTO dto,
            Authentication auth
    ) {
        UUID userId = currentUser.getCurrentUserId(auth);
        authService.changePassword(userId, dto);
        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès"));
    }
}

