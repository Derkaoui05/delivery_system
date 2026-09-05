package com.project.backend.repository;

import com.project.backend.entity.Disponibilite;
import com.project.backend.entity.Livreur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LivreurRepository extends JpaRepository<Livreur, UUID> {
    Optional<Livreur> findByUserId(UUID userId);
    List<Livreur> findByDisponibilite(Disponibilite disponibilite);
    List<Livreur> findByVille(String ville);
}
