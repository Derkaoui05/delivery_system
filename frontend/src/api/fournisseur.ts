// src/api/fournisseur.ts
import { request } from "./client";
import type { Livraison, StatusHistory, CreateLivraisonRequest } from "../types";

export const fournisseurApi = {
  createLivraison: (data: CreateLivraisonRequest): Promise<Livraison> =>
    request<Livraison>("/fournisseur/livraisons", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  myLivraisonsFournisseur: (): Promise<Livraison[]> =>
    request<Livraison[]>("/fournisseur/livraisons"),

  fournisseurGetHistory: (id: string): Promise<StatusHistory[]> =>
    request<StatusHistory[]>(`/fournisseur/livraisons/${id}/history`),
};
