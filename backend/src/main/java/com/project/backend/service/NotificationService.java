package com.project.backend.service;


import com.project.backend.dto.NotificationResponseDTO;
import com.project.backend.entity.*;
import com.project.backend.exception.ForbiddenOperationException;
import com.project.backend.mapper.NotificationMapper;
import com.project.backend.repository.NotificationRepository;
import com.project.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

// service/NotificationService.java
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final UserRepository userRepo;
    private final NotificationMapper mapper;

    public void notify(Livraison livraison, String typeKey) {
        NotificationType type = NotificationType.valueOf(typeKey);

        switch (type) {
            case NOUVELLE_DEMANDE -> notifyAdmins(livraison, type,
                    "Nouvelle demande de livraison " + livraison.getReference());

            case DEMANDE_VALIDEE -> notifyUser(livraison.getFournisseur().getUser(), livraison, type,
                    "Votre demande " + livraison.getReference() + " a été validée");

            case LIVREUR_AFFECTE -> {
                notifyUser(livraison.getFournisseur().getUser(), livraison, type,
                        "Un livreur a été affecté à votre livraison " + livraison.getReference());
                notifyUser(livraison.getLivreur().getUser(), livraison, type,
                        "Une nouvelle livraison vous a été affectée : " + livraison.getReference());
            }

            case COLIS_RECUPERE -> notifyUser(livraison.getFournisseur().getUser(), livraison, type,
                    "Le colis " + livraison.getReference() + " a été récupéré");

            case LIVRAISON_TERMINEE -> notifyUser(livraison.getFournisseur().getUser(), livraison, type,
                    "La livraison " + livraison.getReference() + " est terminée");

            case LIVRAISON_ECHOUEE -> notifyUser(livraison.getFournisseur().getUser(), livraison, type,
                    "La livraison " + livraison.getReference() + " a échoué");
        }
    }

    private void notifyUser(User user, Livraison livraison, NotificationType type, String message) {
        Notification n = new Notification();
        n.setLivraison(livraison);
        n.setType(type);
        n.setMessage(message);
        n.setRecipient(user);
        notificationRepo.save(n);
    }

    private void notifyAdmins(Livraison livraison, NotificationType type, String message) {
        // requires an admin lookup — see note below
        userRepo.findAllByRole(Role.ADMIN).forEach(admin ->
                notifyUser(admin, livraison, type, message));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getForUser(UUID userId, boolean unreadOnly) {
        List<Notification> notifications = unreadOnly
                ? notificationRepo.findByRecipient_IdAndReadFalseOrderByCreatedAtDesc(userId)
                : notificationRepo.findByRecipient_IdOrderByCreatedAtDesc(userId);
        return notifications.stream().map(mapper::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepo.countByRecipient_IdAndReadFalse(userId);
    }

    public void markAsRead(UUID notificationId, UUID userId) {
        Notification n = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification introuvable"));

        if (!n.getRecipient().getId().equals(userId)) {
            throw new ForbiddenOperationException("Cette notification ne vous appartient pas");
        }
        n.setRead(true);
        notificationRepo.save(n);
    }

    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepo.findByRecipient_IdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepo.saveAll(unread);
    }
}