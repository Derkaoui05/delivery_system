package com.project.backend.service;

import com.project.backend.dto.*;
import com.project.backend.entity.*;
import com.project.backend.exception.ForbiddenOperationException;
import com.project.backend.mapper.LivraisonMapper;
import com.project.backend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LivraisonService {
    private final LivraisonRepository livraisonRepo;
    private final FournisseurRepository fournisseurRepo;
    private final LivreurRepository livreurRepo;
    private final UserRepository userRepo;
    private final ClientRepository clientRepo;
    private final LivraisonStatusService statusService;
    private final LivraisonMapper mapper;
    private final NotificationService notificationService;
    private final StatusHistoryRepository statusHistoryRepo;
    private final AuditService auditService;

    public LivraisonResponseDTO create(UUID fournisseurUserId, LivraisonRequestDTO dto) {
        Fournisseur fournisseur = fournisseurRepo.findByUserId(fournisseurUserId)
                .orElseGet(() -> {
                    User user = userRepo.findById(fournisseurUserId)
                            .orElseThrow(() -> new EntityNotFoundException("Fournisseur introuvable"));
                    Fournisseur f = new Fournisseur();
                    f.setUser(user);
                    String name = user.getEmail() != null && user.getEmail().contains("@") 
                            ? user.getEmail().substring(0, user.getEmail().indexOf('@')) 
                            : "fournisseur";
                    f.setRaisonSociale("Société " + name);
                    f.setResponsable(name);
                    f.setVille(dto.clientVille() != null ? dto.clientVille() : "Casablanca");
                    f.setAdresse(dto.clientAdresse() != null ? dto.clientAdresse() : "Adresse");
                    f.setTelephone(dto.clientTelephone() != null ? dto.clientTelephone() : "0600000000");
                    return fournisseurRepo.save(f);
                });

        Client client = clientRepo.findByTelephone(dto.clientTelephone())
                .orElseGet(() -> {
                    Client c = new Client();
                    c.setNom(dto.clientNom());
                    c.setTelephone(dto.clientTelephone());
                    c.setAdresse(dto.clientAdresse());
                    c.setVille(dto.clientVille());
                    return clientRepo.save(c);
                });

        Livraison livraison = new Livraison();
        livraison.setReference(generateReference());
        livraison.setFournisseur(fournisseur);
        livraison.setClient(client);
        livraison.setDescriptionColis(dto.descriptionColis());
        livraison.setNombreColis(dto.nombreColis() != null ? dto.nombreColis() : 1);
        livraison.setPoidsApprox(dto.poidsApprox());
        livraison.setInstructions(dto.instructions());
        livraison.setInstructionsLivraison(dto.instructionsLivraison());
        livraison.setCommentaire(dto.commentaire());
        livraison.setDateSouhaiteeRecuperation(dto.dateSouhaiteeRecuperation());
        livraison.setDateSouhaiteeLivraison(dto.dateSouhaiteeLivraison());
        livraison.setStatut(StatutLivraison.EN_ATTENTE);

        livraison = livraisonRepo.saveAndFlush(livraison);

        try {
            auditService.log("LIVRAISON_CREATED", "Livraison", livraison.getId().toString(), fournisseurUserId, "Création livraison: " + livraison.getReference());
        } catch (Exception ignored) {}

        try {
            notificationService.notify(livraison, "NOUVELLE_DEMANDE");
        } catch (Exception e) {
            System.err.println("Warning: notification failed: " + e.getMessage());
        }

        return mapper.toDTO(livraison);
    }

    public LivraisonResponseDTO validate(UUID livraisonId) {
        Livraison livraison = getOrThrow(livraisonId);
        statusService.transition(livraison, StatutLivraison.VALIDEE, null);
        notificationService.notify(livraison, "DEMANDE_VALIDEE");

        try {
            auditService.log("LIVRAISON_VALIDATED", "Livraison", livraison.getId().toString(), null, "Validation livraison: " + livraison.getReference());
        } catch (Exception ignored) {}

        return mapper.toDTO(livraison);
    }

    public LivraisonResponseDTO assignDriver(UUID livraisonId, AssignDriverDTO dto) {
        Livraison livraison = getOrThrow(livraisonId);
        Livreur livreur = livreurRepo.findById(dto.livreurId())
                .orElseThrow(() -> new EntityNotFoundException("Livreur introuvable"));

        if (livreur.getDisponibilite() != Disponibilite.DISPONIBLE) {
            throw new IllegalStateException("Ce livreur n'est pas disponible");
        }

        livraison.setLivreur(livreur);
        statusService.transition(livraison, StatutLivraison.AFFECTEE, null);
        notificationService.notify(livraison, "LIVREUR_AFFECTE");

        try {
            auditService.log("DRIVER_ASSIGNED", "Livraison", livraison.getId().toString(), livreur.getUser().getId(), "Affectation livreur " + livreur.getNom() + " à livraison: " + livraison.getReference());
        } catch (Exception ignored) {}

        return mapper.toDTO(livraison);
    }

    public LivraisonResponseDTO updateStatus(UUID livraisonId, UUID livreurUserId, StatusChangeDTO dto) {
        Livraison livraison = getOrThrow(livraisonId);

        // ensure the driver updating status is the one assigned
        if (!livraison.getLivreur().getUser().getId().equals(livreurUserId)) {
            throw new ForbiddenOperationException("Cette livraison ne vous est pas affectée");
        }

        if (dto.newStatut() == StatutLivraison.ECHEC_LIVRAISON && dto.motifEchec() == null) {
            throw new IllegalArgumentException("Le motif d'échec est requis");
        }

        statusService.transition(livraison, dto.newStatut(), dto.motifEchec());
        notificationService.notify(livraison, "STATUT_" + dto.newStatut());

        try {
            auditService.log("STATUS_UPDATED", "Livraison", livraison.getId().toString(), livreurUserId, "Changement statut vers " + dto.newStatut() + " pour livraison: " + livraison.getReference());
        } catch (Exception ignored) {}

        return mapper.toDTO(livraison);
    }

    public List<LivraisonResponseDTO> getForFournisseur(UUID fournisseurUserId) {
        return livraisonRepo.findByFournisseur_User_Id(fournisseurUserId)
                .stream().map(mapper::toDTO).toList();
    }

    public List<LivraisonResponseDTO> getByFournisseurEntityId(UUID fournisseurId) {
        return livraisonRepo.findByFournisseur_Id(fournisseurId)
                .stream().map(mapper::toDTO).toList();
    }

    public List<LivraisonResponseDTO> getForLivreur(UUID livreurUserId) {
        return livraisonRepo.findByLivreur_User_Id(livreurUserId)
                .stream().map(mapper::toDTO).toList();
    }

    public List<LivraisonResponseDTO> getByLivreurEntityId(UUID livreurId) {
        return livraisonRepo.findByLivreur_Id(livreurId)
                .stream().map(mapper::toDTO).toList();
    }


    public List<LivraisonResponseDTO> searchForAdmin(String reference, String ville, StatutLivraison statut) {
        return livraisonRepo.search(reference, ville, statut)
                .stream().map(mapper::toDTO).toList();
    }

    public Page<LivraisonResponseDTO> searchAdvancedForAdmin(
            String reference,
            String ville,
            StatutLivraison statut,
            UUID fournisseurId,
            UUID livreurId,
            String clientNom,
            String phone,
            LocalDate dateFrom,
            LocalDate dateTo,
            Pageable pageable
    ) {
        Specification<Livraison> spec = LivraisonSpecifications.withFilters(
                reference, ville, statut, fournisseurId, livreurId, clientNom, phone, dateFrom, dateTo
        );
        return livraisonRepo.findAll(spec, pageable).map(mapper::toDTO);
    }

    public List<LivraisonResponseDTO> searchWithFilters(
            String reference,
            String ville,
            StatutLivraison statut,
            UUID fournisseurId,
            UUID livreurId,
            String clientNom,
            String phone,
            LocalDate dateFrom,
            LocalDate dateTo
    ) {
        Specification<Livraison> spec = LivraisonSpecifications.withFilters(
                reference, ville, statut, fournisseurId, livreurId, clientNom, phone, dateFrom, dateTo
        );
        return livraisonRepo.findAll(spec).stream().map(mapper::toDTO).toList();
    }

    public LivraisonDetailDTO getDetailForAdmin(UUID id) {
        return mapper.toDetailDTO(getOrThrow(id));
    }

    public LivraisonDetailDTO getDetailForFournisseur(UUID id, UUID fournisseurUserId) {
        Livraison livraison = getOrThrow(id);
        verifyFournisseurOwnership(livraison, fournisseurUserId);
        return mapper.toDetailDTO(livraison);
    }

    public LivraisonDetailDTO getDetailForLivreur(UUID id, UUID livreurUserId) {
        Livraison livraison = getOrThrow(id);
        if (livraison.getLivreur() == null || !livraison.getLivreur().getUser().getId().equals(livreurUserId)) {
            throw new ForbiddenOperationException("Cette livraison ne vous est pas affectée");
        }
        return mapper.toDetailDTO(livraison);
    }

    public FournisseurDashboardDTO getFournisseurDashboard(UUID fournisseurUserId) {
        List<Livraison> livraisons = livraisonRepo.findByFournisseur_User_Id(fournisseurUserId);
        Map<String, Long> byStatut = livraisons.stream()
                .collect(Collectors.groupingBy(l -> l.getStatut().name(), Collectors.counting()));
        long enAttente = livraisons.stream().filter(l -> l.getStatut() == StatutLivraison.EN_ATTENTE).count();
        long enCours = livraisons.stream().filter(l -> l.getStatut() == StatutLivraison.VALIDEE 
                || l.getStatut() == StatutLivraison.AFFECTEE 
                || l.getStatut() == StatutLivraison.COLIS_RECUPERE 
                || l.getStatut() == StatutLivraison.EN_LIVRAISON).count();
        long livrees = livraisons.stream().filter(l -> l.getStatut() == StatutLivraison.LIVREE).count();
        long echouees = livraisons.stream().filter(l -> l.getStatut() == StatutLivraison.ECHEC_LIVRAISON).count();

        return new FournisseurDashboardDTO(
                livraisons.size(),
                byStatut,
                enAttente,
                enCours,
                livrees,
                echouees
        );
    }

    public LivreurDashboardDTO getLivreurDashboard(UUID livreurUserId) {
        List<Livraison> missions = livraisonRepo.findByLivreur_User_Id(livreurUserId);
        Map<String, Long> byStatut = missions.stream()
                .collect(Collectors.groupingBy(l -> l.getStatut().name(), Collectors.counting()));
        long affectees = missions.stream().filter(l -> l.getStatut() == StatutLivraison.AFFECTEE).count();
        long enCours = missions.stream().filter(l -> l.getStatut() == StatutLivraison.COLIS_RECUPERE 
                || l.getStatut() == StatutLivraison.EN_LIVRAISON).count();
        long livrees = missions.stream().filter(l -> l.getStatut() == StatutLivraison.LIVREE).count();
        long echouees = missions.stream().filter(l -> l.getStatut() == StatutLivraison.ECHEC_LIVRAISON).count();

        return new LivreurDashboardDTO(
                missions.size(),
                byStatut,
                affectees,
                enCours,
                livrees,
                echouees
        );
    }

    private Livraison getOrThrow(UUID id) {
        return livraisonRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Livraison introuvable"));
    }
    // LivraisonService.java — add this method + inject StatusHistoryRepository
    public List<StatusHistoryDTO> getStatusHistory(UUID livraisonId) {
        return statusHistoryRepo.findByLivraison_IdOrderByChangedAtAsc(livraisonId)
                .stream()
                .map(h -> new StatusHistoryDTO(h.getStatut().name(), h.getMotifEchec(), h.getChangedAt()))
                .toList();
    }
    private String generateReference() {
        int year = LocalDate.now().getYear();
        String prefix = "LIV-" + year + "-";

        // Get the max existing reference number for this year
        long nextNum = livraisonRepo.findMaxReferenceNumber(prefix)
                .map(maxRef -> {
                    // Extract the numeric part from e.g. "LIV-2026-000125"
                    String numPart = maxRef.substring(prefix.length());
                    try {
                        return Long.parseLong(numPart) + 1;
                    } catch (NumberFormatException e) {
                        return livraisonRepo.count() + 1;
                    }
                })
                .orElse(1L);

        // Retry with incrementing number on collision
        for (int attempt = 0; attempt < 10; attempt++) {
            String ref = String.format("LIV-%d-%06d", year, nextNum + attempt);
            if (livraisonRepo.findByReference(ref).isEmpty()) {
                return ref;
            }
        }
        // Ultimate fallback: use UUID suffix to guarantee uniqueness
        return String.format("LIV-%d-%s", year, UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    }
    public DashboardStatsDTO getDashboardStats(){
        List<Livraison> all = livraisonRepo.findAll();

        Map<String, Long> byStatut = all.stream()
                .collect(Collectors.groupingBy(l->l.getStatut().name(), Collectors.counting()));
        return new DashboardStatsDTO(
                all.size(),
                byStatut,
                fournisseurRepo.count(),
                livreurRepo.count()
        );
    }

    private void verifyFournisseurOwnership(Livraison livraison, UUID fournisseurUserId) {
        if (!livraison.getFournisseur().getUser().getId().equals(fournisseurUserId)) {
            throw new ForbiddenOperationException("Cette livraison ne vous appartient pas");
        }
    }

    public List<StatusHistoryDTO> getStatusHistoryForFournisseur(UUID livraisonId, UUID fournisseurUserId) {
        Livraison livraison = livraisonRepo.findById(livraisonId)
                .orElseThrow(() -> new EntityNotFoundException("Livraison introuvable"));
        verifyFournisseurOwnership(livraison, fournisseurUserId);

        return statusHistoryRepo.findByLivraison_IdOrderByChangedAtAsc(livraisonId)
                .stream()
                .map(h -> new StatusHistoryDTO(h.getStatut().name(), h.getMotifEchec(), h.getChangedAt()))
                .toList();
    }

    public List<StatusHistoryDTO> getStatusHistoryForLivreur(UUID livraisonId, UUID livreurUserId) {
        Livraison livraison = livraisonRepo.findById(livraisonId)
                .orElseThrow(() -> new EntityNotFoundException("Livraison introuvable"));

        if (livraison.getLivreur() == null || !livraison.getLivreur().getUser().getId().equals(livreurUserId)) {
            throw new ForbiddenOperationException("Cette livraison ne vous est pas affectée");
        }

        return statusHistoryRepo.findByLivraison_IdOrderByChangedAtAsc(livraisonId)
                .stream()
                .map(h -> new StatusHistoryDTO(h.getStatut().name(), h.getMotifEchec(), h.getChangedAt()))
                .toList();
    }
}
