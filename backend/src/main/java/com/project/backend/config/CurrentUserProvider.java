package com.project.backend.config;

import com.project.backend.entity.User;
import com.project.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CurrentUserProvider {
    private final UserRepository userRepo;

    public User getCurrentUser(Authentication auth){
        return userRepo.findByEmail(auth.getName())
                .orElseThrow(()-> new EntityNotFoundException("Utilisateur introuvable"));
    }
    public UUID getCurrentUserId(Authentication auth){
        return getCurrentUser(auth).getId();
    }
}
