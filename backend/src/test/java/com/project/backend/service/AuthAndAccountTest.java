package com.project.backend.service;

import com.project.backend.dto.LoginRequestDTO;
import com.project.backend.dto.LoginResponseDTO;
import com.project.backend.entity.Role;
import com.project.backend.entity.User;
import com.project.backend.repository.FournisseurRepository;
import com.project.backend.repository.LivreurRepository;
import com.project.backend.repository.UserRepository;
import com.project.backend.security.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthAndAccountTest {

    @Mock
    private UserRepository userRepo;

    @Mock
    private FournisseurRepository fournisseurRepo;

    @Mock
    private LivreurRepository livreurRepo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("Compte désactivé: la tentative de connexion lève DisabledException (403)")
    void testDeactivatedAccountCannotLogin() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("deactivated@test.com");
        user.setPasswordHash("hashed_pwd");
        user.setRole(Role.FOURNISSEUR);
        user.setActive(false); // Désactivé

        when(userRepo.findByEmail("deactivated@test.com")).thenReturn(Optional.of(user));

        LoginRequestDTO dto = new LoginRequestDTO("deactivated@test.com", "Password123!");

        DisabledException ex = assertThrows(DisabledException.class, () ->
                authService.login(dto)
        );
        assertTrue(ex.getMessage().contains("désactivé"));
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    @DisplayName("Identifiants erronés: mot de passe incorrect lève BadCredentialsException (401)")
    void testBadPasswordThrowsException() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@test.com");
        user.setPasswordHash("hashed_pwd");
        user.setRole(Role.LIVREUR);
        user.setActive(true);

        when(userRepo.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "hashed_pwd")).thenReturn(false);

        LoginRequestDTO dto = new LoginRequestDTO("user@test.com", "WrongPassword");

        BadCredentialsException ex = assertThrows(BadCredentialsException.class, () ->
                authService.login(dto)
        );
        assertTrue(ex.getMessage().contains("Identifiants invalides"));
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    @DisplayName("Connexion réussie: retourne token JWT et rôle correct")
    void testSuccessfulLogin() {
        User user = new User();
        UUID userId = UUID.randomUUID();
        user.setId(userId);
        user.setEmail("admin@test.com");
        user.setPasswordHash("hashed_pwd");
        user.setRole(Role.ADMIN);
        user.setActive(true);

        when(userRepo.findByEmail("admin@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("GoodPassword", "hashed_pwd")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("mocked_jwt_token");

        LoginRequestDTO dto = new LoginRequestDTO("admin@test.com", "GoodPassword");

        LoginResponseDTO res = authService.login(dto);

        assertNotNull(res);
        assertEquals("mocked_jwt_token", res.token());
        assertEquals("ADMIN", res.role());
        assertEquals(userId, res.userId());
    }

    @Test
    @DisplayName("Le hash BCrypt de l'admin correspond bien au mot de passe attendu (vérification statique)")
    void adminPasswordHashIsValid() {
        // Hash pré-calculé stocké dans la migration V2__seed_migration.sql
        String storedHash = "$2a$10$dSPCNmJhCvCNSoK4rGyFgeWso42jLJDjl4/6QKY2j4NdFe.oMDLuO";
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder =
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        assertTrue(encoder.matches("Admin#Prod2026!SecureKey99", storedHash),
                "Le hash de la migration doit correspondre au mot de passe admin de production");
    }
}
