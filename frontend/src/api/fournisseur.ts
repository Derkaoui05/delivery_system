// src/api/fournisseur.ts
import { request } from "./client";
import type { 
  Livraison, 
  LivraisonDetail, 
  StatusHistory, 
  CreateLivraisonRequest, 
  FournisseurDashboardStats 
} from "../types";

export const fournisseurApi = {
  createLivraison: (data: CreateLivraisonRequest): Promise<Livraison> =>
    request<Livraison>("/fournisseur/livraisons", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  myLivraisonsFournisseur: (): Promise<Livraison[]> =>
    request<Livraison[]>("/fournisseur/livraisons"),

  getDeliveryDetail: (id: string): Promise<LivraisonDetail> =>
    request<LivraisonDetail>(`/fournisseur/livraisons/${id}`),

  fournisseurGetHistory: (id: string): Promise<StatusHistory[]> =>
    request<StatusHistory[]>(`/fournisseur/livraisons/${id}/history`),

  getFournisseurDashboard: (): Promise<FournisseurDashboardStats> =>
    request<FournisseurDashboardStats>("/fournisseur/dashboard"),
};
