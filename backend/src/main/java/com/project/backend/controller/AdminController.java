package com.project.backend.controller;

import com.project.backend.dto.*;
import com.project.backend.entity.AuditLog;
import com.project.backend.entity.Disponibilite;
import com.project.backend.entity.StatutLivraison;
import com.project.backend.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
    private final AuditService auditService;

    // --- Livraisons ---

    @GetMapping("/livraisons")
    public ResponseEntity<List<LivraisonResponseDTO>> search(
            @RequestParam(required = false) String reference,
            @RequestParam(required = false) String ville,
            @RequestParam(required = false) StatutLivraison statut,
            @RequestParam(required = false) UUID fournisseurId,
            @RequestParam(required = false) UUID livreurId,
            @RequestParam(required = false) String clientNom,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        return ResponseEntity.ok(livraisonService.searchWithFilters(
                reference, ville, statut, fournisseurId, livreurId, clientNom, phone, dateFrom, dateTo
        ));
    }

    @GetMapping("/livraisons/paged")
    public ResponseEntity<Page<LivraisonResponseDTO>> searchPaged(
            @RequestParam(required = false) String reference,
            @RequestParam(required = false) String ville,
            @RequestParam(required = false) StatutLivraison statut,
            @RequestParam(required = false) UUID fournisseurId,
            @RequestParam(required = false) UUID livreurId,
            @RequestParam(required = false) String clientNom,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(livraisonService.searchAdvancedForAdmin(
                reference, ville, statut, fournisseurId, livreurId, clientNom, phone, dateFrom, dateTo,
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        ));
    }

    @GetMapping("/livraisons/{id}")
    public ResponseEntity<LivraisonDetailDTO> getLivraisonDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(livraisonService.getDetailForAdmin(id));
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
        return ResponseEntity.ok(livraisonService.assignDriver(id, dto));
    }

    @GetMapping("/livraisons/{id}/history")
    public ResponseEntity<List<StatusHistoryDTO>> getHistory(@PathVariable UUID id){
        return ResponseEntity.ok(livraisonService.getStatusHistory(id));
    }

    // --- Fournisseurs ---

    @GetMapping("/fournisseurs")
    public ResponseEntity<List<FournisseurResponseDTO>> listFournisseurs(
            @RequestParam(required = false) String ville,
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(fournisseurService.search(ville, active));
    }

    @GetMapping("/fournisseurs/{id}")
    public ResponseEntity<FournisseurResponseDTO> getFournisseur(@PathVariable UUID id) {
        return ResponseEntity.ok(fournisseurService.getById(id));
    }

    @GetMapping("/fournisseurs/{id}/livraisons")
    public ResponseEntity<List<LivraisonResponseDTO>> getFournisseurLivraisons(@PathVariable UUID id) {
        return ResponseEntity.ok(livraisonService.getByFournisseurEntityId(id));
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

    // --- Livreurs ---

    @PostMapping("/livreurs")
    public ResponseEntity<Void> createLivreur(@Valid @RequestBody RegisterLivreurDTO dto){
        authService.registerLivreur(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/livreurs")
    public ResponseEntity<List<LivreurResponseDTO>> listLivreurs(
            @RequestParam(required = false) Disponibilite disponibilite
    ){
        return ResponseEntity.ok(livreurService.search(disponibilite));
    }

    @GetMapping("/livreurs/{id}")
    public ResponseEntity<LivreurResponseDTO> getLivreur(@PathVariable UUID id) {
        return ResponseEntity.ok(livreurService.getById(id));
    }

    @GetMapping("/livreurs/{id}/livraisons")
    public ResponseEntity<List<LivraisonResponseDTO>> getLivreurLivraisons(@PathVariable UUID id) {
        return ResponseEntity.ok(livraisonService.getByLivreurEntityId(id));
    }

    @PutMapping("/livreurs/{id}")
    public ResponseEntity<LivreurResponseDTO> updateLivreur(
            @PathVariable UUID id, @Valid @RequestBody LivreurUpdateDTO dto
    ){
        return ResponseEntity.ok(livreurService.update(id, dto));
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

    // --- Audit Logs (Section 18) ---

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(auditService.getAll(page, size));
    }
}
