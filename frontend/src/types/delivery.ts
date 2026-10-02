// src/types/delivery.ts

export type StatutLivraison =
  | "EN_ATTENTE"
  | "VALIDEE"
  | "AFFECTEE"
  | "COLIS_RECUPERE"
  | "EN_LIVRAISON"
  | "LIVREE"
  | "ECHEC_LIVRAISON";

export interface Livraison {
  id: string;
  reference: string;
  status: StatutLivraison | string;
  clientNom: string;
  clientTelephone?: string;
  clientAdresse?: string;
  clientVille: string;
  instructionsLivraison?: string;
  descriptionColis: string;
  nombreColis?: number;
  poidsApprox?: number;
  instructions?: string;
  fournisseurNom?: string;
  livreurNom?: string | null;
  dateSouhaiteeRecuperation?: string | null;
  dateSouhaiteeLivraison?: string | null;
  commentaire?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StatusHistory {
  statut: StatutLivraison | string;
  motifEchec: string | null;
  changeAt: string;
}

export interface CreateLivraisonRequest {
  descriptionColis: string;
  nombreColis?: number | null;
  poidsApprox?: string | number | null;
  instructions?: string | null;
  clientNom: string;
  clientTelephone: string;
  clientAdresse: string;
  clientVille: string;
  instructionsLivraison?: string | null;
  dateSouhaiteeRecuperation?: string | null;
  dateSouhaiteeLivraison?: string | null;
  commentaire?: string | null;
}

export interface AssignDriverRequest {
  livreurId: string;
}

export interface StatusChangeRequest {
  newStatut: StatutLivraison | string;
  motifEchec?: string;
}
