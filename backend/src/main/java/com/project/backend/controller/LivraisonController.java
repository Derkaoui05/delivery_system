package com.project.backend.controller;

import com.project.backend.config.CurrentUserProvider;
import com.project.backend.dto.LivraisonDetailDTO;
import com.project.backend.entity.Role;
import com.project.backend.entity.User;
import com.project.backend.exception.ForbiddenOperationException;
import com.project.backend.repository.UserRepository;
import com.project.backend.service.LivraisonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/livraisons")
@RequiredArgsConstructor
public class LivraisonController {

    private final LivraisonService livraisonService;
    private final CurrentUserProvider currentUser;
    private final UserRepository userRepo;

    @GetMapping("/{id}")
    public ResponseEntity<LivraisonDetailDTO> getDetail(
            @PathVariable UUID id,
            Authentication auth
    ) {
        UUID userId = currentUser.getCurrentUserId(auth);
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ForbiddenOperationException("Utilisateur non authentifié"));

        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(livraisonService.getDetailForAdmin(id));
        } else if (user.getRole() == Role.FOURNISSEUR) {
            return ResponseEntity.ok(livraisonService.getDetailForFournisseur(id, userId));
        } else if (user.getRole() == Role.LIVREUR) {
            return ResponseEntity.ok(livraisonService.getDetailForLivreur(id, userId));
        }

        throw new ForbiddenOperationException("Rôle non autorisé");
    }
}
