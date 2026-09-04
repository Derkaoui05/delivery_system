package com.project.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Getter @Setter
public class Fournisseur {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String raisonSociale;
    private String responsable;
    private String telephone;
    private String adresse;
    private String ville;

    @OneToMany(mappedBy = "fournisseur")
    private List<Livraison> livraisons;
}
