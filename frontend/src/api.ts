// src/api.ts
const BASE_URL = "http://localhost:8080/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Erreur ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // ── Auth ──────────────────────────────────────────
  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  registerFournisseur: (data: any) =>
    request("/auth/register-fournisseur", { method: "POST", body: JSON.stringify(data) }),

  // ── Admin: Livraisons ──────────────────────────────
  adminSearchLivraisons: (params?: { reference?: string; ville?: string; statut?: string }) => {
    const q = new URLSearchParams();
    if (params?.reference) q.set("reference", params.reference);
    if (params?.ville)     q.set("ville",     params.ville);
    if (params?.statut)    q.set("statut",    params.statut);
    const qs = q.toString();
    return request(`/admin/livraisons${qs ? "?" + qs : ""}`);
  },

  validate: (id: string) =>
    request(`/admin/livraisons/${id}/validate`, { method: "PUT" }),

  assign: (id: string, livreurId: string) =>
    request(`/admin/livraisons/${id}/assign`, {
      method: "PUT",
      body: JSON.stringify({ livreurId }),
    }),

  // ── Admin: Status History ─────────────────────────
  adminGetHistory: (id: string) =>
    request(`/admin/livraisons/${id}/history`),

  // ── Admin: Fournisseurs ───────────────────────────
  adminListFournisseurs: (params?: { ville?: string; active?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.ville !== undefined)  q.set("ville", params.ville);
    if (params?.active !== undefined) q.set("active", String(params.active));
    const qs = q.toString();
    return request(`/admin/fournisseurs${qs ? "?" + qs : ""}`);
  },

  adminGetFournisseur: (id: string) =>
    request(`/admin/fournisseurs/${id}`),

  adminUpdateFournisseur: (id: string, data: any) =>
    request(`/admin/fournisseurs/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  adminActivateFournisseur: (id: string) =>
    request(`/admin/fournisseurs/${id}/activate`, { method: "PUT" }),

  adminDeactivateFournisseur: (id: string) =>
    request(`/admin/fournisseurs/${id}/deactivate`, { method: "PUT" }),

  // ── Admin: Livreurs ───────────────────────────────
  listLivreurs: (disponibilite?: string) => {
    const q = disponibilite ? `?disponibilite=${disponibilite}` : "";
    return request(`/admin/livreurs${q}`);
  },

  createLivreur: (data: any) =>
    request("/admin/livreurs", { method: "POST", body: JSON.stringify(data) }),

  adminUpdateLivreur: (id: string, data: any) =>
    request(`/admin/livreurs/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  adminSetDisponibilite: (id: string, value: string) =>
    request(`/admin/livreurs/${id}/disponibilite?value=${value}`, { method: "PUT" }),

  adminDeactivateLivreur: (id: string) =>
    request(`/admin/livreurs/${id}/desactivate`, { method: "PUT" }),

  // ── Fournisseur ───────────────────────────────────
  createLivraison: (data: any) =>
    request("/fournisseur/livraisons", { method: "POST", body: JSON.stringify(data) }),

  myLivraisonsFournisseur: () =>
    request("/fournisseur/livraisons"),

  fournisseurGetHistory: (id: string) =>
    request(`/fournisseur/livraisons/${id}/history`),

  // ── Livreur ───────────────────────────────────────
  myLivraisonsLivreur: () =>
    request("/livreur/livraisons"),

  updateStatus: (id: string, newStatut: string, motifEchec?: string) =>
    request(`/livreur/livraisons/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ newStatut, motifEchec }),
    }),

  livreurGetHistory: (id: string) =>
    request(`/livreur/livraisons/${id}/history`),

  // ── Notifications ─────────────────────────────────
  getNotifications: (unReadOnly = false) =>
    request(`/notifications?unReadOnly=${unReadOnly}`),

  markNotificationRead: (id: string) =>
    request(`/notifications/${id}/read`, { method: "PUT" }),
};