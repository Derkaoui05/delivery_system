package com.project.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
public class Livraison {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String reference; // e.g. LIV-2026-000125, generated in service layer

    @ManyToOne
    @JoinColumn(name = "fournisseur_id", nullable = false)
    private Fournisseur fournisseur;

    @ManyToOne @JoinColumn(name = "livreur_id") // nullable until affectation
    private Livreur livreur;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client; // or @ManyToOne if you want clients reusable across deliveries

    private String descriptionColis;
    private Integer nombreColis;
    private Double poidsApprox;
    private String instructions;

    @Enumerated(EnumType.STRING)
    private StatutLivraison statut = StatutLivraison.EN_ATTENTE;

    private LocalDate dateSouhaiteeRecuperation;
    private LocalDate dateSouhaiteeLivraison;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "livraison", cascade = CascadeType.ALL)
    private List<StatusHistory> statusHistory = new ArrayList<>();
}
