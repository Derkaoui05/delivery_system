package com.project.backend.repository;

import com.project.backend.entity.Livraison;
import com.project.backend.entity.Livreur;
import com.project.backend.entity.StatutLivraison;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LivraisonRepository extends JpaRepository<Livraison, UUID> {
    Optional<Livraison> findByReference(String reference);

    List<Livraison> findByFournisseur_User_Id(UUID fournisseurUserId);

    List<Livraison> findByLivreur_User_Id(UUID livreurUserId);

    @Query("SELECT l FROM Livraison l WHERE " +
            "(:reference IS NULL OR l.reference LIKE %:reference%) AND " +
            "(:ville IS NULL OR l.client.ville = :ville) AND " +
            "(:statut IS NULL OR l.statut = :statut)")
    List<Livraison> search(@Param("reference") String reference,
                           @Param("ville") String ville,
                           @Param("statut") StatutLivraison statut);
}
