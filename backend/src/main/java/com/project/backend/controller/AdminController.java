package com.project.backend.controller;


import com.project.backend.dto.*;
import com.project.backend.entity.Disponibilite;
import com.project.backend.entity.Livreur;
import com.project.backend.entity.StatutLivraison;
import com.project.backend.repository.FournisseurRepository;
import com.project.backend.repository.LivreurRepository;
import com.project.backend.service.AuthService;
import com.project.backend.service.FournisseurService;
import com.project.backend.service.LivraisonService;
import com.project.backend.service.LivreurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final LivraisonService livraisonService;
    private final AuthService authService;
    private final FournisseurService fournisseurService;
    private final LivreurService livreurService;

    // livraisons
    @GetMapping("/livraisons")
    public ResponseEntity<List<LivraisonResponseDTO>> search(
            @RequestParam(required = false) String reference,
            @RequestParam(required = false) String ville,
            @RequestParam(required = false)StatutLivraison statut
            ){
        return ResponseEntity.ok(livraisonService.searchForAdmin(reference,ville,statut));
    }
    @PutMapping("/livraisons/{id}/validate")
    public ResponseEntity<LivraisonResponseDTO> validate(@PathVariable UUID id){
        return ResponseEntity.ok(livraisonService.validate(id));
    }
    @PutMapping("/livraisons/{id}/assign")
    public ResponseEntity<LivraisonResponseDTO> assign(
            @PathVariable UUID id,
            @Valid @RequestBody AssignDriverDTO dto
            ){
        return ResponseEntity.ok(livraisonService.assignDriver(id,dto));
    }

    // Fournisseurs
    @PostMapping("/livreurs")
    public ResponseEntity<Void> createLivreur(@Valid @RequestBody RegisterLivreurDTO dto){
        authService.registerLivreur(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    @GetMapping("/livreurs")
    public ResponseEntity<List<FournisseurResponseDTO>> listFournisseurs(
            @RequestParam(required = false) String ville,
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(fournisseurService.search(ville, active));
    }
    @GetMapping("/fournisseurs/{id}")
    public ResponseEntity<FournisseurResponseDTO> getFournisseur(@PathVariable UUID id) {
        return ResponseEntity.ok(fournisseurService.getById(id));
    }

    @PutMapping("/fournisseurs/{id}")
    public ResponseEntity<FournisseurResponseDTO> updateFournisseur(
            @PathVariable UUID id, @Valid @RequestBody FournisseurUpdateDTO dto) {
        return ResponseEntity.ok(fournisseurService.update(id, dto));
    }

    @PutMapping("/fournisseurs/{id}/activate")
    public ResponseEntity<Void> activateFournisseur(@PathVariable UUID id) {
        fournisseurService.setActive(id, true);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/fournisseurs/{id}/deactivate")
    public ResponseEntity<Void> deactivateFournisseur(@PathVariable UUID id) {
        fournisseurService.setActive(id, false);
        return ResponseEntity.noContent().build();
    }

    //livreurs
    @GetMapping("/livreurs")
    public ResponseEntity<List<LivreurResponseDTO>> listLivreurs(
            @RequestParam(required = false) Disponibilite disponibilite
    ){
        return ResponseEntity.ok(livreurService.search(disponibilite));
    }

    @PutMapping("/livreurs/{id}")
    public ResponseEntity<LivreurResponseDTO> updateLivreur(
            @PathVariable UUID id, @Valid @RequestBody LivreurUpdateDTO dto
    ){
        return ResponseEntity.ok(livreurService.update(id,dto));
    }

    @PutMapping("/livreurs/{id}/disponibilite")
    public ResponseEntity<Void> setDisponibilite(
            @PathVariable UUID id, @RequestParam Disponibilite value
    ){
        livreurService.setDisponibilite(id, value);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/livreurs/{id}/desactivate")
    public ResponseEntity<Void> desactivateLivreur(@PathVariable UUID id){
        livreurService.setActive(id, false);
        return ResponseEntity.noContent().build();
    }


    // status history (available to admin)
    @GetMapping("/livraisons/{id}/history")
    public ResponseEntity<List<StatusHistoryDTO>> getHistory(@PathVariable UUID id){
        return ResponseEntity.ok(livraisonService.getStatusHistory(id));
    }
}
