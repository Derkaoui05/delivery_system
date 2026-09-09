package com.project.backend.controller;

import com.project.backend.config.CurrentUserProvider;
import com.project.backend.dto.LivraisonResponseDTO;
import com.project.backend.dto.StatusChangeDTO;
import com.project.backend.service.LivraisonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/livreur")
@RequiredArgsConstructor
@PreAuthorize("hasRole('LIVREUR')")
public class LivreurController {
    private final LivraisonService livraisonService;
    private final CurrentUserProvider currentUser;

    @GetMapping("/livraisons")
    public ResponseEntity<List<LivraisonResponseDTO>> myMissions(Authentication auth){
        UUID userId = currentUser.getCurrentUserId(auth);
        return ResponseEntity.ok(livraisonService.getForLivreur(userId));
    }

    @PutMapping("/livraison/{id}/status")
    public ResponseEntity<LivraisonResponseDTO> updateStatus(
            @PathVariable UUID id, @Valid @RequestBody StatusChangeDTO dto, Authentication auth
            ){
        UUID userId = currentUser.getCurrentUserId(auth);
        return ResponseEntity.ok(livraisonService.updateStatus(id,userId,dto));
    }
}
