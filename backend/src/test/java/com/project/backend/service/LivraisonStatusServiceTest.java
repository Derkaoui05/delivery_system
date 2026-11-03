package com.project.backend.service;

import com.project.backend.entity.Livraison;
import com.project.backend.entity.StatusHistory;
import com.project.backend.entity.StatutLivraison;
import com.project.backend.repository.StatutHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LivraisonStatusServiceTest {

    @Mock
    private StatutHistoryRepository historyRepo;

    @InjectMocks
    private LivraisonStatusService statusService;

    private Livraison livraison;

    @BeforeEach
    void setUp() {
        livraison = new Livraison();
        livraison.setStatut(StatutLivraison.EN_ATTENTE);
    }

    @Test
    @DisplayName("Transition valide: EN_ATTENTE -> VALIDEE")
    void testTransitionEnAttenteToValidee() {
        statusService.transition(livraison, StatutLivraison.VALIDEE, null);

        assertEquals(StatutLivraison.VALIDEE, livraison.getStatut());
        ArgumentCaptor<StatusHistory> captor = ArgumentCaptor.forClass(StatusHistory.class);
        verify(historyRepo).save(captor.capture());
        assertEquals(StatutLivraison.VALIDEE, captor.getValue().getStatut());
        assertNull(captor.getValue().getMotifEchec());
    }

    @Test
    @DisplayName("Transition valide: VALIDEE -> AFFECTEE")
    void testTransitionValideeToAffectee() {
        livraison.setStatut(StatutLivraison.VALIDEE);
        statusService.transition(livraison, StatutLivraison.AFFECTEE, null);

        assertEquals(StatutLivraison.AFFECTEE, livraison.getStatut());
        verify(historyRepo).save(any(StatusHistory.class));
    }

    @Test
    @DisplayName("Transition valide: AFFECTEE -> COLIS_RECUPERE")
    void testTransitionAffecteeToColisRecupere() {
        livraison.setStatut(StatutLivraison.AFFECTEE);
        statusService.transition(livraison, StatutLivraison.COLIS_RECUPERE, null);

        assertEquals(StatutLivraison.COLIS_RECUPERE, livraison.getStatut());
        verify(historyRepo).save(any(StatusHistory.class));
    }

    @Test
    @DisplayName("Transition valide: COLIS_RECUPERE -> EN_LIVRAISON")
    void testTransitionColisRecupereToEnLivraison() {
        livraison.setStatut(StatutLivraison.COLIS_RECUPERE);
        statusService.transition(livraison, StatutLivraison.EN_LIVRAISON, null);

        assertEquals(StatutLivraison.EN_LIVRAISON, livraison.getStatut());
        verify(historyRepo).save(any(StatusHistory.class));
    }

    @Test
    @DisplayName("Transition valide: EN_LIVRAISON -> LIVREE")
    void testTransitionEnLivraisonToLivree() {
        livraison.setStatut(StatutLivraison.EN_LIVRAISON);
        statusService.transition(livraison, StatutLivraison.LIVREE, null);

        assertEquals(StatutLivraison.LIVREE, livraison.getStatut());
        verify(historyRepo).save(any(StatusHistory.class));
    }

    @Test
    @DisplayName("Transition valide: EN_LIVRAISON -> ECHEC_LIVRAISON avec motif")
    void testTransitionEnLivraisonToEchecLivraison() {
        livraison.setStatut(StatutLivraison.EN_LIVRAISON);
        statusService.transition(livraison, StatutLivraison.ECHEC_LIVRAISON, "Client absent");

        assertEquals(StatutLivraison.ECHEC_LIVRAISON, livraison.getStatut());
        ArgumentCaptor<StatusHistory> captor = ArgumentCaptor.forClass(StatusHistory.class);
        verify(historyRepo).save(captor.capture());
        assertEquals(StatutLivraison.ECHEC_LIVRAISON, captor.getValue().getStatut());
        assertEquals("Client absent", captor.getValue().getMotifEchec());
    }

    @Test
    @DisplayName("Transition invalide: EN_ATTENTE -> AFFECTEE (saut d'étape)")
    void testTransitionInvalideEnAttenteToAffectee() {
        livraison.setStatut(StatutLivraison.EN_ATTENTE);
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                statusService.transition(livraison, StatutLivraison.AFFECTEE, null)
        );
        assertTrue(ex.getMessage().contains("Transition invalide"));
        verify(historyRepo, never()).save(any());
    }

    @Test
    @DisplayName("Transition invalide: EN_ATTENTE -> LIVREE (saut d'étape)")
    void testTransitionInvalideEnAttenteToLivree() {
        livraison.setStatut(StatutLivraison.EN_ATTENTE);
        assertThrows(IllegalStateException.class, () ->
                statusService.transition(livraison, StatutLivraison.LIVREE, null)
        );
    }

    @Test
    @DisplayName("Transition invalide: VALIDEE -> LIVREE (saut d'étape)")
    void testTransitionInvalideValideeToLivree() {
        livraison.setStatut(StatutLivraison.VALIDEE);
        assertThrows(IllegalStateException.class, () ->
                statusService.transition(livraison, StatutLivraison.LIVREE, null)
        );
    }

    @Test
    @DisplayName("Transition invalide: COLIS_RECUPERE -> LIVREE (saut d'étape)")
    void testTransitionInvalideColisRecupereToLivree() {
        livraison.setStatut(StatutLivraison.COLIS_RECUPERE);
        assertThrows(IllegalStateException.class, () ->
                statusService.transition(livraison, StatutLivraison.LIVREE, null)
        );
    }

    @Test
    @DisplayName("Transition invalide depuis état terminal: LIVREE -> EN_LIVRAISON")
    void testTransitionInvalideLivreeVersEnLivraison() {
        livraison.setStatut(StatutLivraison.LIVREE);
        assertThrows(IllegalStateException.class, () ->
                statusService.transition(livraison, StatutLivraison.EN_LIVRAISON, null)
        );
    }

    @Test
    @DisplayName("Transition invalide depuis état terminal: ECHEC_LIVRAISON -> LIVREE")
    void testTransitionInvalideEchecVersLivree() {
        livraison.setStatut(StatutLivraison.ECHEC_LIVRAISON);
        assertThrows(IllegalStateException.class, () ->
                statusService.transition(livraison, StatutLivraison.LIVREE, null)
        );
    }
}

