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
  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  registerFournisseur: (data: any) =>
    request("/auth/register-fournisseur", { method: "POST", body: JSON.stringify(data) }),

  createLivreur: (data: any) =>
    request("/admin/livreurs", { method: "POST", body: JSON.stringify(data) }),

  listLivreurs: () => request("/admin/livreurs"),

  createLivraison: (data: any) =>
    request("/fournisseur/livraisons", { method: "POST", body: JSON.stringify(data) }),

  myLivraisonsFournisseur: () => request("/fournisseur/livraisons"),

  myLivraisonsLivreur: () => request("/livreur/livraisons"),

  adminSearchLivraisons: () => request("/admin/livraisons"),

  validate: (id: string) => request(`/admin/livraisons/${id}/validate`, { method: "PUT" }),

  assign: (id: string, livreurId: string) =>
    request(`/admin/livraisons/${id}/assign`, {
      method: "PUT",
      body: JSON.stringify({ livreurId }),
    }),

  updateStatus: (id: string, newStatut: string, motifEchec?: string) =>
    request(`/livreur/livraisons/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ newStatut, motifEchec }),
    }),
};