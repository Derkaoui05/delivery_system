package com.project.backend.mapper;

import com.project.backend.dto.NotificationResponseDTO;
import com.project.backend.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {
    public NotificationResponseDTO toDTO(Notification n) {
        return new NotificationResponseDTO(
                n.getId(),
                n.getType().name(),
                n.getMessage(),
                n.isRead(),
                n.getLivraison().getId(),
                n.getLivraison().getReference(),
                n.getCreatedAt()
        );
    }
}
