package com.project.backend.service;

import com.project.backend.dto.LoginRequestDTO;
import com.project.backend.dto.LoginResponseDTO;
import com.project.backend.dto.RegisterFournisseurDTO;
import com.project.backend.dto.RegisterLivreurDTO;
import com.project.backend.entity.Fournisseur;
import com.project.backend.entity.Livreur;
import com.project.backend.entity.Role;
import com.project.backend.entity.User;
import com.project.backend.repository.FournisseurRepository;
import com.project.backend.repository.LivreurRepository;
import com.project.backend.repository.UserRepository;
import com.project.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;
    private final FournisseurRepository fournisseurRepo;
    private final LivreurRepository livreurRepo;
    private final PasswordEncoder passwordEncoder;
    private JwtService jwtService;

    public LoginResponseDTO login(LoginRequestDTO dto){
        User user = userRepo.findByEmail(dto.email()).orElseThrow(()->new BadCredentialsException("Identifiants invalides"));

        if (!user.isActive()){
            throw new DisabledException("compte désactivé");
        }
        if(!passwordEncoder.matches(dto.password(), user.getPasswordHash())){
            throw new BadCredentialsException("Identifiants invalides");
        }
        String token = jwtService.generateToken(user);
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
        userRepo.save(user);

        Fournisseur f = new Fournisseur();
        f.setUser(user);
        f.setRaisonSociale(dto.raisonSociale());
        f.setResponsable(dto.responsable());
        f.setTelephone(dto.telephone());
        f.setAdresse(dto.adresse());
        f.setVille(dto.ville());
        fournisseurRepo.save(f);
    }

    // AuthService.java — add this method
    public void registerLivreur(RegisterLivreurDTO dto) {
        if (userRepo.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }
        User user = new User();
        user.setEmail(dto.email());
        user.setPasswordHash(passwordEncoder.encode(dto.password()));
        user.setRole(Role.LIVREUR);
        userRepo.save(user);

        Livreur l = new Livreur();
        l.setUser(user);
        l.setNom(dto.nom());
        l.setTelephone(dto.telephone());
        l.setAdresse(dto.adresse());
        l.setVille(dto.ville());
        livreurRepo.save(l);
    }

}
