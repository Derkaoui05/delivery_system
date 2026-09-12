package com.project.backend.service;

import com.project.backend.dto.*;
import com.project.backend.entity.*;
import com.project.backend.exception.ForbiddenOperationException;
import com.project.backend.mapper.LivraisonMapper;
import com.project.backend.repository.ClientRepository;
import com.project.backend.repository.FournisseurRepository;
import com.project.backend.repository.LivraisonRepository;
import com.project.backend.repository.LivreurRepository;
import com.project.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
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
        livraison.setDateSouhaiteeRecuperation(dto.dateSouhaiteeRecuperation());
        livraison.setDateSouhaiteeLivraison(dto.dateSouhaiteeLivraison());
        livraison.setStatut(StatutLivraison.EN_ATTENTE);

        livraison = livraisonRepo.saveAndFlush(livraison);

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
        String ref = String.format("LIV-%d-%06d", year, count);
        while (livraisonRepo.findByReference(ref).isPresent()) {
            count++;
            ref = String.format("LIV-%d-%06d", year, count);
        }
        return ref;
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
}
