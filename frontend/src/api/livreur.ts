// src/api/livreur.ts
import { request } from "./client";
import type { 
  Livraison, 
  LivraisonDetail, 
  StatusHistory, 
  StatutLivraison, 
  LivreurDashboardStats 
} from "../types";

export const livreurApi = {
  myLivraisonsLivreur: (): Promise<Livraison[]> =>
    request<Livraison[]>("/livreur/livraisons"),

  getDeliveryDetail: (id: string): Promise<LivraisonDetail> =>
    request<LivraisonDetail>(`/livreur/livraisons/${id}`),

  updateStatus: (id: string, newStatut: StatutLivraison | string, motifEchec?: string): Promise<Livraison> =>
    request<Livraison>(`/livreur/livraisons/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ newStatut, motifEchec }),
    }),

  livreurGetHistory: (id: string): Promise<StatusHistory[]> =>
    request<StatusHistory[]>(`/livreur/livraisons/${id}/history`),

  getLivreurDashboard: (): Promise<LivreurDashboardStats> =>
    request<LivreurDashboardStats>("/livreur/dashboard"),
};
