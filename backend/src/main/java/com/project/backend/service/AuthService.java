package com.project.backend.service;

import com.project.backend.dto.*;
import com.project.backend.entity.Fournisseur;
import com.project.backend.entity.Livreur;
import com.project.backend.entity.Role;
import com.project.backend.entity.User;
import com.project.backend.repository.FournisseurRepository;
import com.project.backend.repository.LivreurRepository;
import com.project.backend.repository.UserRepository;
import com.project.backend.security.JwtService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    private final UserRepository userRepo;
    private final FournisseurRepository fournisseurRepo;
    private final LivreurRepository livreurRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;

    public LoginResponseDTO login(LoginRequestDTO dto){
        User user = userRepo.findByEmail(dto.email()).orElseThrow(()->new BadCredentialsException("Identifiants invalides"));

        if (!user.isActive()){
            throw new DisabledException("compte désactivé");
        }
        if(!passwordEncoder.matches(dto.password(), user.getPasswordHash())){
            throw new BadCredentialsException("Identifiants invalides");
        }
        String token = jwtService.generateToken(user);
        try {
            auditService.log("USER_LOGIN", "User", user.getId().toString(), user.getId(), "Connexion réussie: " + user.getEmail());
        } catch (Exception ignored) {}
        return new LoginResponseDTO(token, user.getRole().name(), user.getId());
    }

    public void registerFournisseur(RegisterFournisseurDTO dto) {
        if (userRepo.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }
        User user = new User();
        user.setEmail(dto.email());
        user.setPasswordHash(passwordEncoder.encode(dto.password()));
        user.setRole(Role.FOURNISSEUR);
        user = userRepo.save(user);

        Fournisseur f = new Fournisseur();
        f.setUser(user);
        f.setRaisonSociale(dto.raisonSociale());
        f.setResponsable(dto.responsable());
        f.setTelephone(dto.telephone());
        f.setAdresse(dto.adresse());
        f.setVille(dto.ville());
        fournisseurRepo.save(f);

        try {
            auditService.log("REGISTER_FOURNISSEUR", "User", user.getId().toString(), user.getId(), "Inscription fournisseur: " + user.getEmail());
        } catch (Exception ignored) {}
    }

    public void registerLivreur(RegisterLivreurDTO dto) {
        if (userRepo.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }
        User user = new User();
        user.setEmail(dto.email());
        user.setPasswordHash(passwordEncoder.encode(dto.password()));
        user.setRole(Role.LIVREUR);
        user = userRepo.save(user);

        Livreur l = new Livreur();
        l.setUser(user);
        l.setNom(dto.nom());
        l.setTelephone(dto.telephone());
        l.setAdresse(dto.adresse());
        l.setVille(dto.ville());
        livreurRepo.save(l);

        try {
            auditService.log("REGISTER_LIVREUR", "User", user.getId().toString(), user.getId(), "Inscription livreur: " + user.getEmail());
        } catch (Exception ignored) {}
    }

    public String forgotPassword(ForgotPasswordDTO dto) {
        User user = userRepo.findByEmail(dto.email())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé avec cet email"));
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepo.save(user);

        try {
            auditService.log("FORGOT_PASSWORD_REQUEST", "User", user.getId().toString(), user.getId(), "Demande de réinitialisation: " + user.getEmail());
        } catch (Exception ignored) {}
        return token;
    }

    public void resetPassword(ResetPasswordDTO dto) {
        User user = userRepo.findByResetToken(dto.token())
                .orElseThrow(() -> new IllegalArgumentException("Jeton de réinitialisation invalide"));
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Le jeton de réinitialisation a expiré");
        }
        user.setPasswordHash(passwordEncoder.encode(dto.newPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepo.save(user);

        try {
            auditService.log("RESET_PASSWORD_SUCCESS", "User", user.getId().toString(), user.getId(), "Mot de passe réinitialisé");
        } catch (Exception ignored) {}
    }

    public void changePassword(UUID userId, ChangePasswordDTO dto) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));
        if (!passwordEncoder.matches(dto.currentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Le mot de passe actuel est incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(dto.newPassword()));
        userRepo.save(user);

        try {
            auditService.log("CHANGE_PASSWORD_SUCCESS", "User", user.getId().toString(), user.getId(), "Mot de passe modifié");
        } catch (Exception ignored) {}
    }
}

