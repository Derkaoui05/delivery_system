package com.project.backend.mapper;

import com.project.backend.dto.LivraisonResponseDTO;
import com.project.backend.entity.Livraison;
import org.springframework.stereotype.Component;

@Component
public class LivraisonMapper {
    public LivraisonResponseDTO toDTO(Livraison l) {
        return new LivraisonResponseDTO(
                l.getId(),
                l.getReference(),
                l.getStatut().name(),
                l.getFournisseur().getRaisonSociale(),
                l.getLivreur() != null ? l.getLivreur().getNom() : null,
                l.getClient().getNom(),
                l.getClient().getVille(),
                l.getDescriptionColis(),
                l.getDateSouhaiteeRecuperation(),
                l.getDateSouhaiteeLivraison(),
                l.getCreatedAt()
        );
    }
}
