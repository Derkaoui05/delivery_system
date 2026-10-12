// src/api/admin.ts
import { request } from "./client";
import type {
  Livraison,
  LivraisonDetail,
  Livreur,
  Fournisseur,
  StatusHistory,
  RegisterLivreurRequest,
  UpdateLivreurRequest,
  UpdateFournisseurRequest,
  Disponibilite,
  StatutLivraison,
  AuditLog,
  PageResponse,
} from "../types";

export interface AdminLivraisonSearchParams {
  reference?: string;
  ville?: string;
  statut?: StatutLivraison | string;
  fournisseurId?: string;
  livreurId?: string;
  clientNom?: string;
  phone?: string;
  dateFrom?: string;
  dateTo?: string;
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
    if (params?.fournisseurId) q.set("fournisseurId", params.fournisseurId);
    if (params?.livreurId) q.set("livreurId", params.livreurId);
    if (params?.clientNom) q.set("clientNom", params.clientNom);
    if (params?.phone) q.set("phone", params.phone);
    if (params?.dateFrom) q.set("dateFrom", params.dateFrom);
    if (params?.dateTo) q.set("dateTo", params.dateTo);
    const qs = q.toString();
    return request<Livraison[]>(`/admin/livraisons${qs ? "?" + qs : ""}`);
  },

  adminGetDeliveryDetail: (id: string): Promise<LivraisonDetail> =>
    request<LivraisonDetail>(`/admin/livraisons/${id}`),

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

  adminGetFournisseurDeliveries: (id: string): Promise<Livraison[]> =>
    request<Livraison[]>(`/admin/fournisseurs/${id}/livraisons`),

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

  adminGetLivreur: (id: string): Promise<Livreur> =>
    request<Livreur>(`/admin/livreurs/${id}`),

  adminGetLivreurDeliveries: (id: string): Promise<Livraison[]> =>
    request<Livraison[]>(`/admin/livreurs/${id}/livraisons`),

  createLivreur: (data: RegisterLivreurRequest): Promise<void> =>
    request<void>("/admin/livreurs", { method: "POST", body: JSON.stringify(data) }),

  adminUpdateLivreur: (id: string, data: UpdateLivreurRequest): Promise<Livreur> =>
    request<Livreur>(`/admin/livreurs/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  adminSetDisponibilite: (id: string, value: Disponibilite | string): Promise<void> =>
    request<void>(`/admin/livreurs/${id}/disponibilite?value=${value}`, { method: "PUT" }),

  adminDeactivateLivreur: (id: string): Promise<void> =>
    request<void>(`/admin/livreurs/${id}/desactivate`, { method: "PUT" }),

  // Audit Logs (Section 18)
  adminGetAuditLogs: (page = 0, size = 20): Promise<PageResponse<AuditLog>> =>
    request<PageResponse<AuditLog>>(`/admin/audit-logs?page=${page}&size=${size}`),
};
