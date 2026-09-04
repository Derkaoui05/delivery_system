package com.project.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter @Setter
public class StatusHistory {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne @JoinColumn(name="livraison_id", nullable = false)
    private Livraison livraison;

    @Enumerated(EnumType.STRING)
    private StatutLivraison statut;

    private String motifEchec;

    @CreationTimestamp
    private LocalDateTime changeAt;


}
