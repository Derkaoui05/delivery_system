package com.project.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "status_history")
@Getter @Setter
public class StatusHistory {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne @JoinColumn(name="livraison_id", nullable = false)
    private Livraison livraison;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private StatutLivraison statut;

    private String motifEchec;

    @Column(name = "changed_at")
    @CreationTimestamp
    private LocalDateTime changedAt;


}
