package com.project.backend.repository;

import com.project.backend.entity.Fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FournisseurRepository extends JpaRepository<Fournisseur, UUID> {
}
