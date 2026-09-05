package com.project.backend.service;

import com.project.backend.dto.AssignDriverDTO;
import com.project.backend.dto.LivraisonRequestDTO;
import com.project.backend.dto.LivraisonResponseDTO;
import com.project.backend.dto.StatusChangeDTO;
import com.project.backend.entity.*;
import com.project.backend.exception.ForbiddenOperationException;
import com.project.backend.mapper.LivraisonMapper;
import com.project.backend.repository.FournisseurRepository;
import com.project.backend.repository.LivraisonRepository;
import com.project.backend.repository.LivreurRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LivraisonService {
    private final LivraisonRepository livraisonRepo;
    private final FournisseurRepository fournisseurRepo;
    private final LivreurRepository livreurRepo;
    private final LivraisonStatusService statusService;
    private final LivraisonMapper mapper;
    private final NotificationService notificationService;

    public LivraisonResponseDTO create(UUID fournisseurUserId, LivraisonRequestDTO dto) {
        Fournisseur fournisseur = fournisseurRepo.findByUserId(fournisseurUserId)
                .orElseThrow(() -> new EntityNotFoundException("Fournisseur introuvable"));

        Client client = new Client();
        client.setNom(dto.clientNom());
        client.setTelephone(dto.clientTelephone());
        client.setAdresse(dto.clientAdresse());
        client.setVille(dto.clientVille());

        Livraison livraison = new Livraison();
        livraison.setReference(generateReference());
        livraison.setFournisseur(fournisseur);
        livraison.setClient(client);
        livraison.setDescriptionColis(dto.descriptionColis());
        livraison.setNombreColis(dto.nombreColis());
        livraison.setPoidsApprox(dto.poidsApprox());
        livraison.setInstructions(dto.instructions());
        livraison.setDateSouhaiteeRecuperation(dto.dateSouhaiteeRecuperation());
        livraison.setDateSouhaiteeLivraison(dto.dateSouhaiteeLivraison());
        livraison.setStatut(StatutLivraison.EN_ATTENTE);

        livraisonRepo.save(livraison);
        notificationService.notify(livraison, "NOUVELLE_DEMANDE");

        return mapper.toDTO(livraison);
    }

    public LivraisonResponseDTO validate(UUID livraisonId) {
        Livraison livraison = getOrThrow(livraisonId);
        statusService.transition(livraison, StatutLivraison.VALIDEE, null);
        notificationService.notify(livraison, "DEMANDE_VALIDEE");
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

        return mapper.toDTO(livraison);
    }

    public List<LivraisonResponseDTO> getForFournisseur(UUID fournisseurUserId) {
        return livraisonRepo.findByFournisseur_User_Id(fournisseurUserId)
                .stream().map(mapper::toDTO).toList();
    }

    public List<LivraisonResponseDTO> getForLivreur(UUID livreurUserId) {
        return livraisonRepo.findByLivreur_User_Id(livreurUserId)
                .stream().map(mapper::toDTO).toList();
    }

    public List<LivraisonResponseDTO> searchForAdmin(String reference, String ville, StatutLivraison statut) {
        return livraisonRepo.search(reference, ville, statut)
                .stream().map(mapper::toDTO).toList();
    }

    private Livraison getOrThrow(UUID id) {
        return livraisonRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Livraison introuvable"));
    }

    private String generateReference() {
        int year = LocalDate.now().getYear();
        long count = livraisonRepo.count() + 1;
        return String.format("LIV-%d-%06d", year, count);
    }
}
