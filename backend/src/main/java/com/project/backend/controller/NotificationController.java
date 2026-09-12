package com.project.backend.controller;


import com.project.backend.config.CurrentUserProvider;
import com.project.backend.entity.Notification;
import com.project.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final CurrentUserProvider currentUser;

    @GetMapping
    public ResponseEntity<List<Notification>> myNotifications(
            @RequestParam(defaultValue = "false") boolean unReadOnly,
            Authentication auth
    ){
        UUID userId = currentUser.getCurrentUserId(auth);
        return ResponseEntity.ok(notificationService.getForUser(userId,unReadOnly));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id, Authentication auth) {
        UUID userId = currentUser.getCurrentUserId(auth);
        notificationService.markAsRead(id, userId);
        return ResponseEntity.noContent().build();
    }
}
