package com.project.backend.dto;

import java.util.Map;

/**
 * Dashboard statistics for a Livreur (section 10 of the cahier des charges).
 */
public record LivreurDashboardDTO(
        long totalMissions,
        Map<String, Long> missionsByStatut,
        long affectees,
        long enCours,
        long livrees,
        long echouees
) {
}
