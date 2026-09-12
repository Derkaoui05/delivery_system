package com.project.backend.dto;

import java.util.Map;

public record DashboardStatsDTO(
        long totalLivraisons,
        Map<String, Long> livraisonByStatut,
        long nombreFounrnisseurs,
        long nombreLivreurs
) {
}
