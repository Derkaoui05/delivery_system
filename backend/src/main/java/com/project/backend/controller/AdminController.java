package com.project.backend.controller;


import com.project.backend.dto.AssignDriverDTO;
import com.project.backend.dto.LivraisonResponseDTO;
import com.project.backend.dto.RegisterLivreurDTO;
import com.project.backend.entity.Disponibilite;
import com.project.backend.entity.Livreur;
import com.project.backend.entity.StatutLivraison;
import com.project.backend.repository.FournisseurRepository;
import com.project.backend.repository.LivreurRepository;
import com.project.backend.service.AuthService;
import com.project.backend.service.LivraisonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    private final FournisseurRepository fournisseurRepo;
    private final LivreurRepository livreurRepo;

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
    public ResponseEntity<List<Livreur>> listLivreurs(
            @RequestParam(required = false)Disponibilite disponibilite
            ){
        List<Livreur> livreurs = disponibilite!=null
                ? livreurRepo.findByDisponibilite(disponibilite)
                : livreurRepo.findAll();
        return ResponseEntity.ok(livreurs);
    }
}
