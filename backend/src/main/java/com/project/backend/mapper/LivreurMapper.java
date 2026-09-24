package com.project.backend.mapper;

import com.project.backend.dto.LivreurResponseDTO;
import com.project.backend.entity.Livreur;
import org.springframework.stereotype.Component;

@Component
public class LivreurMapper {
    public LivreurResponseDTO toDTO(Livreur l) {
        return new LivreurResponseDTO(
                l.getId(),
                l.getUser().getEmail(),
                l.getNom(),
                l.getTelephone(),
                l.getAdresse(),
                l.getVille(),
                l.getDisponibilite().name(),
                l.getUser().isActive()
        );
    }
}
