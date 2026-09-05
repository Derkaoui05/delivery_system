package com.project.backend.repository;

import com.project.backend.entity.Livraison;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LivraisonRepository extends JpaRepository<Livraison, UUID> {
}
