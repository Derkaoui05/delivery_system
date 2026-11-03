package com.project.backend.service;

import com.project.backend.dto.AssignDriverDTO;
import com.project.backend.dto.StatusChangeDTO;
import com.project.backend.entity.*;
import com.project.backend.exception.ForbiddenOperationException;
import com.project.backend.mapper.LivraisonMapper;
import com.project.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LivraisonAccessControlTest {

    @Mock
    private LivraisonRepository livraisonRepo;

    @Mock
    private FournisseurRepository fournisseurRepo;

    @Mock
    private LivreurRepository livreurRepo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private ClientRepository clientRepo;

    @Mock
    private LivraisonStatusService statusService;

    @Mock
    private LivraisonMapper mapper;

    @Mock
    private NotificationService notificationService;

    @Mock
    private StatusHistoryRepository statusHistoryRepo;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private LivraisonService livraisonService;

    private Livraison livraison;
    private Fournisseur fournisseur;
    private User fournisseurUser;
    private Livreur assignedLivreur;
    private User assignedLivreurUser;
    private UUID livraisonId;

    @BeforeEach
    void setUp() {
        livraisonId = UUID.randomUUID();

        // Fournisseur 1
        fournisseurUser = new User();
        fournisseurUser.setId(UUID.randomUUID());
        fournisseurUser.setEmail("fournisseur1@test.com");
        fournisseurUser.setRole(Role.FOURNISSEUR);
        fournisseurUser.setActive(true);

        fournisseur = new Fournisseur();
        fournisseur.setId(UUID.randomUUID());
        fournisseur.setUser(fournisseurUser);
        fournisseur.setRaisonSociale("Fournisseur 1");

        // Assigned driver
        assignedLivreurUser = new User();
        assignedLivreurUser.setId(UUID.randomUUID());
        assignedLivreurUser.setEmail("driver1@test.com");
        assignedLivreurUser.setRole(Role.LIVREUR);
        assignedLivreurUser.setActive(true);

        assignedLivreur = new Livreur();
        assignedLivreur.setId(UUID.randomUUID());
        assignedLivreur.setUser(assignedLivreurUser);
        assignedLivreur.setNom("Livreur 1");
        assignedLivreur.setDisponibilite(Disponibilite.DISPONIBLE);

        // Livraison
        livraison = new Livraison();
        livraison.setId(livraisonId);
        livraison.setReference("LIV-2026-000001");
        livraison.setFournisseur(fournisseur);
        livraison.setLivreur(assignedLivreur);
        livraison.setStatut(StatutLivraison.AFFECTEE);
    }

    @Test
    @DisplayName("Isolement Fournisseur: Un fournisseur tiers ne peut pas voir le détail")
    void testFournisseurCannotViewOtherDeliveries() {
        UUID otherFournisseurUserId = UUID.randomUUID();
        when(livraisonRepo.findById(livraisonId)).thenReturn(Optional.of(livraison));

        ForbiddenOperationException ex = assertThrows(ForbiddenOperationException.class, () ->
                livraisonService.getDetailForFournisseur(livraisonId, otherFournisseurUserId)
        );
        assertTrue(ex.getMessage().contains("ne vous appartient pas"));
    }

    @Test
    @DisplayName("Isolement Fournisseur: Le fournisseur propriétaire peut voir le détail")
    void testOwnerFournisseurCanViewDetail() {
        when(livraisonRepo.findById(livraisonId)).thenReturn(Optional.of(livraison));

        assertDoesNotThrow(() ->
                livraisonService.getDetailForFournisseur(livraisonId, fournisseurUser.getId())
        );
        verify(mapper).toDetailDTO(livraison);
    }

    @Test
    @DisplayName("Isolement Livreur: Un livreur non affecté ne peut pas voir le détail")
    void testLivreurCannotViewUnassignedDelivery() {
        UUID otherLivreurUserId = UUID.randomUUID();
        when(livraisonRepo.findById(livraisonId)).thenReturn(Optional.of(livraison));

        ForbiddenOperationException ex = assertThrows(ForbiddenOperationException.class, () ->
                livraisonService.getDetailForLivreur(livraisonId, otherLivreurUserId)
        );
        assertTrue(ex.getMessage().contains("ne vous est pas affectée"));
    }

    @Test
    @DisplayName("Isolement Livreur: Le livreur affecté peut voir le détail")
    void testAssignedLivreurCanViewDetail() {
        when(livraisonRepo.findById(livraisonId)).thenReturn(Optional.of(livraison));

        assertDoesNotThrow(() ->
                livraisonService.getDetailForLivreur(livraisonId, assignedLivreurUser.getId())
        );
        verify(mapper).toDetailDTO(livraison);
    }

    @Test
    @DisplayName("Isolement Livreur: Un livreur non affecté ne peut pas changer le statut")
    void testLivreurCannotUpdateStatusIfNotAssigned() {
        UUID otherLivreurUserId = UUID.randomUUID();
        when(livraisonRepo.findById(livraisonId)).thenReturn(Optional.of(livraison));

        StatusChangeDTO dto = new StatusChangeDTO(StatutLivraison.COLIS_RECUPERE, null);

        ForbiddenOperationException ex = assertThrows(ForbiddenOperationException.class, () ->
                livraisonService.updateStatus(livraisonId, otherLivreurUserId, dto)
        );
        assertTrue(ex.getMessage().contains("ne vous est pas affectée"));
        verify(statusService, never()).transition(any(), any(), any());
    }

    @Test
    @DisplayName("Changement de statut vers ECHEC_LIVRAISON sans motif -> IllegalArgumentException")
    void testFailDeliveryWithoutMotifThrowsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                new StatusChangeDTO(StatutLivraison.ECHEC_LIVRAISON, null)
        );
        assertTrue(ex.getMessage().contains("motif d'échec est requis"));

        IllegalArgumentException ex2 = assertThrows(IllegalArgumentException.class, () ->
                new StatusChangeDTO(StatutLivraison.ECHEC_LIVRAISON, "   ")
        );
        assertTrue(ex2.getMessage().contains("motif d'échec est requis"));
    }

    @Test
    @DisplayName("Affectation: Impossible d'affecter un livreur non disponible")
    void testCannotAssignUnavailableDriver() {
        when(livraisonRepo.findById(livraisonId)).thenReturn(Optional.of(livraison));

        Livreur busyDriver = new Livreur();
        busyDriver.setId(UUID.randomUUID());
        busyDriver.setNom("Driver Indisponible");
        busyDriver.setDisponibilite(Disponibilite.INDISPONIBLE);

        when(livreurRepo.findById(busyDriver.getId())).thenReturn(Optional.of(busyDriver));

        AssignDriverDTO dto = new AssignDriverDTO(busyDriver.getId());

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                livraisonService.assignDriver(livraisonId, dto)
        );
        assertTrue(ex.getMessage().contains("pas disponible"));
        verify(statusService, never()).transition(any(), any(), any());
    }
}
