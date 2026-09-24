package com.project.backend.service;


import com.project.backend.dto.FournisseurResponseDTO;
import com.project.backend.dto.FournisseurUpdateDTO;
import com.project.backend.entity.Fournisseur;
import com.project.backend.entity.User;
import com.project.backend.mapper.FournisseurMapper;
import com.project.backend.repository.FournisseurRepository;
import com.project.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FournisseurService {
    private final FournisseurRepository fournisseurRepo;
    private final UserRepository userRepo;
    private final FournisseurMapper mapper;

    public List<FournisseurResponseDTO> search(String ville, Boolean active){
        return fournisseurRepo.search(ville,active).stream().map(mapper::toDTO).toList();
    }
    public FournisseurResponseDTO getById(UUID id) {
        return mapper.toDTO(getOrThrow(id));
    }

    public FournisseurResponseDTO update(UUID id, FournisseurUpdateDTO dto) {
        Fournisseur f = getOrThrow(id);
        f.setRaisonSociale(dto.raisonSociale());
        f.setResponsable(dto.responsable());
        f.setTelephone(dto.telephone());
        f.setAdresse(dto.adresse());
        f.setVille(dto.ville());
        fournisseurRepo.save(f);
        return mapper.toDTO(f);
    }

    public void setActive(UUID id, boolean active) {
        Fournisseur f = getOrThrow(id);
        User user = f.getUser();
        user.setActive(active);
        userRepo.save(user);
    }

    private Fournisseur getOrThrow(UUID id) {
        return fournisseurRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fournisseur introuvable"));
    }
}
