package com.project.backend.repository;

import com.project.backend.entity.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StatutHistoryRepository extends JpaRepository<StatusHistory, UUID> {
}
