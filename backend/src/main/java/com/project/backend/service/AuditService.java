package com.project.backend.service;

import com.project.backend.entity.AuditLog;
import com.project.backend.entity.User;
import com.project.backend.repository.AuditLogRepository;
import com.project.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service for audit logging (section 18).
 * Uses REQUIRES_NEW propagation so audit logs are persisted even if
 * the parent transaction rolls back.
 */
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepo;
    private final UserRepository userRepo;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entityType, String entityId,
                    UUID userId, String details) {
        AuditLog entry = new AuditLog();
        entry.setAction(action);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setDetails(details);

        if (userId != null) {
            userRepo.findById(userId).ifPresent(entry::setUser);
        }

        auditLogRepo.save(entry);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepo.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getByEntity(String entityType, String entityId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepo.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
                entityType, entityId, pageable);
    }
}
