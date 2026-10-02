// src/utils/statusHelpers.ts

import type { StatutLivraison } from "../types";
export type { StatutLivraison };

interface StatusMeta {
  label: string;
  badgeClass: string;
  icon: string;
  order: number;
}

export const STATUS_META: Record<StatutLivraison, StatusMeta> = {
  EN_ATTENTE:       { label: "En attente",     badgeClass: "badge-pending",   icon: "⏳", order: 0 },
  VALIDEE:          { label: "Validée",         badgeClass: "badge-validated", icon: "✅", order: 1 },
  AFFECTEE:         { label: "Affectée",        badgeClass: "badge-assigned",  icon: "📋", order: 2 },
  COLIS_RECUPERE:   { label: "Colis récupéré", badgeClass: "badge-picked",    icon: "📦", order: 3 },
  EN_LIVRAISON:     { label: "En livraison",   badgeClass: "badge-delivering", icon: "🚚", order: 4 },
  LIVREE:           { label: "Livrée",          badgeClass: "badge-delivered", icon: "🎉", order: 5 },
  ECHEC_LIVRAISON:  { label: "Échec",           badgeClass: "badge-failed",    icon: "❌", order: 6 },
};

export function getStatusMeta(status: string): StatusMeta {
  return STATUS_META[status as StatutLivraison] ?? {
    label: status,
    badgeClass: "badge-pending",
    icon: "❓",
    order: -1,
  };
}

export const LIVREUR_NEXT_STATUS: Record<string, string> = {
  AFFECTEE:       "COLIS_RECUPERE",
  COLIS_RECUPERE: "EN_LIVRAISON",
  EN_LIVRAISON:   "LIVREE",
};

export const ALL_STATUTS: StatutLivraison[] = [
  "EN_ATTENTE",
  "VALIDEE",
  "AFFECTEE",
  "COLIS_RECUPERE",
  "EN_LIVRAISON",
  "LIVREE",
  "ECHEC_LIVRAISON",
];
