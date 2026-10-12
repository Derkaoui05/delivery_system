package com.project.backend.repository;

import com.project.backend.entity.Livraison;
import com.project.backend.entity.StatutLivraison;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LivraisonRepository extends JpaRepository<Livraison, UUID>, JpaSpecificationExecutor<Livraison> {
    Optional<Livraison> findByReference(String reference);

    List<Livraison> findByFournisseur_User_Id(UUID fournisseurUserId);
    List<Livraison> findByFournisseur_Id(UUID fournisseurId);

    List<Livraison> findByLivreur_User_Id(UUID livreurUserId);
    List<Livraison> findByLivreur_Id(UUID livreurId);


    @Query("SELECT l FROM Livraison l WHERE " +
            "(:reference IS NULL OR l.reference LIKE %:reference%) AND " +
            "(:ville IS NULL OR l.client.ville = :ville) AND " +
            "(:statut IS NULL OR l.statut = :statut)")
    List<Livraison> search(@Param("reference") String reference,
                           @Param("ville") String ville,
                           @Param("statut") StatutLivraison statut);

    @Query("SELECT MAX(l.reference) FROM Livraison l WHERE l.reference LIKE :prefix%")
    Optional<String> findMaxReferenceNumber(@Param("prefix") String prefix);

    long countByFournisseur_User_Id(UUID fournisseurUserId);
    long countByLivreur_User_Id(UUID livreurUserId);
    long countByFournisseur_User_IdAndStatut(UUID fournisseurUserId, StatutLivraison statut);
    long countByLivreur_User_IdAndStatut(UUID livreurUserId, StatutLivraison statut);
}
