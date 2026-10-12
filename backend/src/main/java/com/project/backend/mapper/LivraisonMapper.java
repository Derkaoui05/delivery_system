package com.project.backend.mapper;

import com.project.backend.dto.LivraisonDetailDTO;
import com.project.backend.dto.LivraisonResponseDTO;
import com.project.backend.dto.StatusHistoryDTO;
import com.project.backend.entity.Livraison;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LivraisonMapper {
    public LivraisonResponseDTO toDTO(Livraison l) {
        return new LivraisonResponseDTO(
                l.getId(),
                l.getReference(),
                l.getStatut().name(),
                // Fournisseur (Point A)
                l.getFournisseur().getRaisonSociale(),
                l.getFournisseur().getTelephone(),
                l.getFournisseur().getAdresse(),
                l.getFournisseur().getVille(),
                // Livreur
                l.getLivreur() != null ? l.getLivreur().getNom() : null,
                l.getLivreur() != null ? l.getLivreur().getTelephone() : null,
                // Client (Point B)
                l.getClient().getNom(),
                l.getClient().getTelephone(),
                l.getClient().getAdresse(),
                l.getClient().getVille(),
                // Colis
                l.getDescriptionColis(),
                l.getNombreColis(),
                l.getPoidsApprox(),
                l.getInstructions(),
                l.getInstructionsLivraison(),
                l.getCommentaire(),
                // Dates
                l.getDateSouhaiteeRecuperation(),
                l.getDateSouhaiteeLivraison(),
                l.getCreatedAt()
        );
    }

    public LivraisonDetailDTO toDetailDTO(Livraison l) {
        List<StatusHistoryDTO> history = l.getStatusHistory().stream()
                .map(h -> new StatusHistoryDTO(h.getStatut().name(), h.getMotifEchec(), h.getChangedAt()))
                .toList();

        return new LivraisonDetailDTO(
                l.getId(),
                l.getReference(),
                l.getStatut().name(),
                // Fournisseur (Point A)
                l.getFournisseur().getRaisonSociale(),
                l.getFournisseur().getTelephone(),
                l.getFournisseur().getAdresse(),
                l.getFournisseur().getVille(),
                // Livreur
                l.getLivreur() != null ? l.getLivreur().getNom() : null,
                l.getLivreur() != null ? l.getLivreur().getTelephone() : null,
                // Client (Point B)
                l.getClient().getNom(),
                l.getClient().getTelephone(),
                l.getClient().getAdresse(),
                l.getClient().getVille(),
                // Colis
                l.getDescriptionColis(),
                l.getNombreColis(),
                l.getPoidsApprox(),
                l.getInstructions(),
                l.getInstructionsLivraison(),
                l.getCommentaire(),
                // Dates
                l.getDateSouhaiteeRecuperation(),
                l.getDateSouhaiteeLivraison(),
                l.getCreatedAt(),
                // History
                history
        );
    }
}
