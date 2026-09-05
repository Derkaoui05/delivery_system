package com.project.backend.repository;

import com.project.backend.entity.Livreur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LivreurRepository extends JpaRepository<Livreur, UUID> {
}
