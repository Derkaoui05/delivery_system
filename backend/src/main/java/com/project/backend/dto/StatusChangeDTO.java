package com.project.backend.dto;

import com.project.backend.entity.StatutLivraison;
import jakarta.validation.constraints.NotNull;

// dto/livraison/StatusChangeDTO.java
public record StatusChangeDTO(
        @NotNull(message = "Le nouveau statut est requis")
        StatutLivraison newStatut,

        String motifEchec
) {
        public StatusChangeDTO {
                if (newStatut == StatutLivraison.ECHEC_LIVRAISON &&
                        (motifEchec == null || motifEchec.isBlank())) {
                        throw new IllegalArgumentException("Le motif d'échec est requis pour ce statut");
                }
        }
}