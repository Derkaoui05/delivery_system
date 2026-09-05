package com.project.backend.service;


import com.project.backend.entity.Livraison;
import com.project.backend.entity.StatusHistory;
import com.project.backend.entity.StatutLivraison;
import com.project.backend.repository.StatutHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class LivraisonStatusService {
    private static final Map<StatutLivraison, Set<StatutLivraison>> TRANSITIONS = Map.of(
            StatutLivraison.EN_ATTENTE, Set.of(StatutLivraison.VALIDEE),
            StatutLivraison.VALIDEE, Set.of(StatutLivraison.AFFECTEE),
            StatutLivraison.AFFECTEE, Set.of(StatutLivraison.COLIS_RECUPERE),
            StatutLivraison.COLIS_RECUPERE, Set.of(StatutLivraison.EN_LIVRAISON),
            StatutLivraison.EN_LIVRAISON, Set.of(StatutLivraison.LIVREE, StatutLivraison.ECHEC_LIVRAISON));

    private final StatutHistoryRepository historyRepo;
    public void transition(Livraison livraison,  StatutLivraison newStatut, String motifEchec){
        Set<StatutLivraison> allowed  = TRANSITIONS.getOrDefault(livraison.getStatut(), Set.of());
        if(!allowed.contains(newStatut)){
            throw new IllegalStateException(
                    "Transition invalide : " + livraison.getStatut() + " -> " + newStatut
            );
        }
        livraison.setStatut(newStatut);

        StatusHistory history = new StatusHistory();
        history.setLivraison(livraison);
        history.setStatut(newStatut);
        history.setMotifEchec(motifEchec);
        historyRepo.save(history);
    }
}
