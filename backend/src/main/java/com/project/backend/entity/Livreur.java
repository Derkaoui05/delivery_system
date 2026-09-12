package com.project.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "livreurs")
@Getter @Setter
public class Livreur {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false,unique = true)
    private User user;

    private String nom;
    private String telephone;
    private String adresse;
    private String ville;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Disponibilite disponibilite = Disponibilite.DISPONIBLE;
}
