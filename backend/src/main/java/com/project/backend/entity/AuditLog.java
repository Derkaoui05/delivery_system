package com.project.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Audit log for tracking important operations (section 18).
 * "Journalisation des opérations importantes"
 */
@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_action", columnList = "action"),
        @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id"),
        @Index(name = "idx_audit_user", columnList = "user_id"),
        @Index(name = "idx_audit_created", columnList = "created_at")
})
@Getter
@Setter
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String action; // e.g. LIVRAISON_CREATED, STATUS_CHANGED, USER_LOGIN

    @Column(name = "entity_type", length = 50)
    private String entityType; // e.g. Livraison, User

    @Column(name = "entity_id")
    private String entityId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 500)
    private String details;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
}
