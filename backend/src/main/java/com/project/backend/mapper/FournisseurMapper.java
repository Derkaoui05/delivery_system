package com.project.backend.mapper;

import com.project.backend.dto.FournisseurResponseDTO;
import com.project.backend.entity.Fournisseur;
import org.springframework.stereotype.Component;

@Component
public class FournisseurMapper {
    public FournisseurResponseDTO toDTO(Fournisseur f){
        return new FournisseurResponseDTO(
                f.getId(),f.getUser().getEmail(), f.getRaisonSociale(), f.getResponsable(),
                f.getTelephone(), f.getAdresse(), f.getVille(), f.getUser().isActive(),
                f.getUser().getCreatedAt()
        );
    }
}
