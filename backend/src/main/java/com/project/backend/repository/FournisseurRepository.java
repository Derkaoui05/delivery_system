package com.project.backend.repository;

import com.project.backend.entity.Fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FournisseurRepository extends JpaRepository<Fournisseur, UUID> {
    Optional<Fournisseur> findByUserId(UUID userId);

    @Query("SELECT f FROM Fournisseur f WHERE " +
            "(:ville IS NULL OR f.ville = :ville) AND " +
            "(:active IS NULL OR f.user.active = :active)")
    List<Fournisseur> search(@Param("ville") String ville, @Param("active") Boolean active);
}
