// src/api/admin.ts
import { request } from "./client";
import type {
  Livraison,
  Livreur,
  Fournisseur,
  StatusHistory,
  RegisterLivreurRequest,
  UpdateLivreurRequest,
  UpdateFournisseurRequest,
  Disponibilite,
  StatutLivraison,
} from "../types";

export interface AdminLivraisonSearchParams {
  reference?: string;
  ville?: string;
  statut?: StatutLivraison | string;
}

export interface AdminFournisseurSearchParams {
  ville?: string;
  active?: boolean;
}

export const adminApi = {
  // Livraisons
  adminSearchLivraisons: (params?: AdminLivraisonSearchParams): Promise<Livraison[]> => {
    const q = new URLSearchParams();
    if (params?.reference) q.set("reference", params.reference);
    if (params?.ville) q.set("ville", params.ville);
    if (params?.statut) q.set("statut", params.statut);
    const qs = q.toString();
    return request<Livraison[]>(`/admin/livraisons${qs ? "?" + qs : ""}`);
  },

  validate: (id: string): Promise<Livraison> =>
    request<Livraison>(`/admin/livraisons/${id}/validate`, { method: "PUT" }),

  assign: (id: string, livreurId: string): Promise<Livraison> =>
    request<Livraison>(`/admin/livraisons/${id}/assign`, {
      method: "PUT",
      body: JSON.stringify({ livreurId }),
    }),

  adminGetHistory: (id: string): Promise<StatusHistory[]> =>
    request<StatusHistory[]>(`/admin/livraisons/${id}/history`),

  // Fournisseurs
  adminListFournisseurs: (params?: AdminFournisseurSearchParams): Promise<Fournisseur[]> => {
    const q = new URLSearchParams();
    if (params?.ville !== undefined) q.set("ville", params.ville);
    if (params?.active !== undefined) q.set("active", String(params.active));
    const qs = q.toString();
    return request<Fournisseur[]>(`/admin/fournisseurs${qs ? "?" + qs : ""}`);
  },

  adminGetFournisseur: (id: string): Promise<Fournisseur> =>
    request<Fournisseur>(`/admin/fournisseurs/${id}`),

  adminUpdateFournisseur: (id: string, data: UpdateFournisseurRequest): Promise<Fournisseur> =>
    request<Fournisseur>(`/admin/fournisseurs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  adminActivateFournisseur: (id: string): Promise<void> =>
    request<void>(`/admin/fournisseurs/${id}/activate`, { method: "PUT" }),

  adminDeactivateFournisseur: (id: string): Promise<void> =>
    request<void>(`/admin/fournisseurs/${id}/deactivate`, { method: "PUT" }),

  // Livreurs
  listLivreurs: (disponibilite?: Disponibilite | string): Promise<Livreur[]> => {
    const q = disponibilite ? `?disponibilite=${disponibilite}` : "";
    return request<Livreur[]>(`/admin/livreurs${q}`);
  },

  createLivreur: (data: RegisterLivreurRequest): Promise<void> =>
    request<void>("/admin/livreurs", { method: "POST", body: JSON.stringify(data) }),

  adminUpdateLivreur: (id: string, data: UpdateLivreurRequest): Promise<Livreur> =>
    request<Livreur>(`/admin/livreurs/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  adminSetDisponibilite: (id: string, value: Disponibilite | string): Promise<void> =>
    request<void>(`/admin/livreurs/${id}/disponibilite?value=${value}`, { method: "PUT" }),

  adminDeactivateLivreur: (id: string): Promise<void> =>
    request<void>(`/admin/livreurs/${id}/desactivate`, { method: "PUT" }),
};
