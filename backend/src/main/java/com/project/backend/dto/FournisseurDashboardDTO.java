package com.project.backend.dto;

import java.util.Map;

/**
 * Dashboard statistics for a Fournisseur (section 9 of the cahier des charges).
 */
public record FournisseurDashboardDTO(
        long totalLivraisons,
        Map<String, Long> livraisonsByStatut,
        long enAttente,
        long enCours,
        long livrees,
        long echouees
) {
}
