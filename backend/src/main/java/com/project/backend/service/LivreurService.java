package com.project.backend.service;


import com.project.backend.dto.LivreurResponseDTO;
import com.project.backend.dto.LivreurUpdateDTO;
import com.project.backend.entity.Disponibilite;
import com.project.backend.entity.Livreur;
import com.project.backend.entity.User;
import com.project.backend.mapper.LivreurMapper;
import com.project.backend.repository.LivreurRepository;
import com.project.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LivreurService {

    private final LivreurRepository livreurRepo;
    private final UserRepository userRepo;
    private final LivreurMapper mapper;

    public List<LivreurResponseDTO> search(Disponibilite disponibilite) {
        List<Livreur> livreurs = disponibilite != null
                ? livreurRepo.findByDisponibilite(disponibilite)
                : livreurRepo.findAll();
        return livreurs.stream().map(mapper::toDTO).toList();
    }

    public LivreurResponseDTO update(UUID id, LivreurUpdateDTO dto) {
        Livreur l = getOrThrow(id);
        l.setNom(dto.nom());
        l.setTelephone(dto.telephone());
        l.setAdresse(dto.adresse());
        l.setVille(dto.ville());
        livreurRepo.save(l);
        return mapper.toDTO(l);
    }

    public void setDisponibilite(UUID id, Disponibilite disponibilite) {
        Livreur l = getOrThrow(id);
        l.setDisponibilite(disponibilite);
        livreurRepo.save(l);
    }

    public void setActive(UUID id, boolean active) {
        Livreur l = getOrThrow(id);
        User user = l.getUser();
        user.setActive(active);
        userRepo.save(user);
    }

    private Livreur getOrThrow(UUID id) {
        return livreurRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Livreur introuvable"));
    }
}
