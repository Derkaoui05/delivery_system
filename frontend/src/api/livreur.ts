// src/api/livreur.ts
import { request } from "./client";
import type { Livraison, StatusHistory, StatutLivraison } from "../types";

export const livreurApi = {
  myLivraisonsLivreur: (): Promise<Livraison[]> =>
    request<Livraison[]>("/livreur/livraisons"),

  updateStatus: (id: string, newStatut: StatutLivraison | string, motifEchec?: string): Promise<Livraison> =>
    request<Livraison>(`/livreur/livraisons/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ newStatut, motifEchec }),
    }),

  livreurGetHistory: (id: string): Promise<StatusHistory[]> =>
    request<StatusHistory[]>(`/livreur/livraisons/${id}/history`),
};
