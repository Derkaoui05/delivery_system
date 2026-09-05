package com.project.backend.repository;

import com.project.backend.entity.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StatutHistoryRepository extends JpaRepository<StatusHistory, UUID> {
    List<StatusHistory> findByLivraison_IdOrderByChangedAtAsc(UUID livraisonId);
}
