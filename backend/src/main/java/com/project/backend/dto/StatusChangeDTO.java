package com.project.backend.dto;

import com.project.backend.entity.StatutLivraison;
import jakarta.validation.constraints.NotNull;

public record StatusChangeDTO(
        @NotNull StatutLivraison newStatut,
        String motifEchec // required only when newStatut == ECHEC_LIVRAISON, validated in service
        ) {
}
