package com.project.backend.controller;


import com.project.backend.config.CurrentUserProvider;
import com.project.backend.dto.*;
import com.project.backend.service.LivraisonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/fournisseur")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FOURNISSEUR')")
public class FournisseurController {

    private final LivraisonService livraisonService;
    private final CurrentUserProvider currentUser;

    @PostMapping("/livraisons")
    public ResponseEntity<LivraisonResponseDTO> create(
            @Valid @RequestBody LivraisonRequestDTO dto, Authentication auth
            ){
        UUID userId = currentUser.getCurrentUserId(auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(livraisonService.create(userId,dto));
    }

    @GetMapping("/livraisons")
    public ResponseEntity<List<LivraisonResponseDTO>> myLivraisons(Authentication auth) {
        UUID userId = currentUser.getCurrentUserId(auth);
        return ResponseEntity.ok(livraisonService.getForFournisseur(userId));
    }

    @GetMapping("/livraisons/{id}")
    public ResponseEntity<LivraisonDetailDTO> getLivraisonDetail(@PathVariable UUID id, Authentication auth) {
        UUID userId = currentUser.getCurrentUserId(auth);
        return ResponseEntity.ok(livraisonService.getDetailForFournisseur(id, userId));
    }

    @GetMapping("/livraisons/{id}/history")
    public ResponseEntity<List<StatusHistoryDTO>> getHistory(@PathVariable UUID id, Authentication auth) {
        UUID userId = currentUser.getCurrentUserId(auth);
        return ResponseEntity.ok(livraisonService.getStatusHistoryForFournisseur(id, userId));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<FournisseurDashboardDTO> getDashboard(Authentication auth) {
        UUID userId = currentUser.getCurrentUserId(auth);
        return ResponseEntity.ok(livraisonService.getFournisseurDashboard(userId));
    }
}
