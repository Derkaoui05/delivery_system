package com.project.backend.repository;

import com.project.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByLivraison_IdOrderByCreatedAtDesc(UUID livraisonId);
    List<Notification> findByRecipient_IdOrderByCreatedAtDesc(UUID userId);
    List<Notification> findByRecipient_IdAndReadFalseOrderByCreatedAtDesc(UUID userId);
}
