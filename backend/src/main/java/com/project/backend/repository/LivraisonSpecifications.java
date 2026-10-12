package com.project.backend.repository;

import com.project.backend.entity.Livraison;
import com.project.backend.entity.StatutLivraison;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * JPA Specifications for dynamic Livraison queries.
 * Supports searching by: reference, ville, statut, fournisseur, livreur,
 * client name, phone, and date ranges.
 */
public final class LivraisonSpecifications {

    private LivraisonSpecifications() {
    }

    public static Specification<Livraison> withFilters(
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
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (reference != null && !reference.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("reference")),
                        "%" + reference.toLowerCase() + "%"));
            }

            if (ville != null && !ville.isBlank()) {
                var clientJoin = root.join("client", JoinType.LEFT);
                predicates.add(cb.equal(cb.lower(clientJoin.get("ville")),
                        ville.toLowerCase()));
            }

            if (statut != null) {
                predicates.add(cb.equal(root.get("statut"), statut));
            }

            if (fournisseurId != null) {
                predicates.add(cb.equal(root.get("fournisseur").get("id"), fournisseurId));
            }

            if (livreurId != null) {
                predicates.add(cb.equal(root.get("livreur").get("id"), livreurId));
            }

            if (clientNom != null && !clientNom.isBlank()) {
                var clientJoin = root.join("client", JoinType.LEFT);
                predicates.add(cb.like(cb.lower(clientJoin.get("nom")),
                        "%" + clientNom.toLowerCase() + "%"));
            }

            if (phone != null && !phone.isBlank()) {
                // Search phone across client and fournisseur
                var clientJoin = root.join("client", JoinType.LEFT);
                var fournisseurJoin = root.join("fournisseur", JoinType.LEFT);
                predicates.add(cb.or(
                        cb.like(clientJoin.get("telephone"), "%" + phone + "%"),
                        cb.like(fournisseurJoin.get("telephone"), "%" + phone + "%")
                ));
            }

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("createdAt"), dateFrom.atStartOfDay()));
            }

            if (dateTo != null) {
                predicates.add(cb.lessThan(
                        root.get("createdAt"), dateTo.plusDays(1).atStartOfDay()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
