// src/utils/statusHelpers.tsx
import type { ReactNode } from "react";
import {
  Clock,
  CheckCircle2,
  ClipboardList,
  PackageCheck,
  Truck,
  Sparkles,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import type { StatutLivraison } from "../types";

export type { StatutLivraison };

export interface StatusMeta {
  label: string;
  badgeClass: string;
  icon: ReactNode;
  order: number;
}

export const STATUS_META: Record<StatutLivraison, StatusMeta> = {
  EN_ATTENTE: {
    label: "En attente",
    badgeClass: "badge-pending",
    icon: <Clock size={12} strokeWidth={2} />,
    order: 0,
  },
  VALIDEE: {
    label: "Validée",
    badgeClass: "badge-validated",
    icon: <CheckCircle2 size={12} strokeWidth={2} />,
    order: 1,
  },
  AFFECTEE: {
    label: "Affectée",
    badgeClass: "badge-assigned",
    icon: <ClipboardList size={12} strokeWidth={2} />,
    order: 2,
  },
  COLIS_RECUPERE: {
    label: "Colis récupéré",
    badgeClass: "badge-picked",
    icon: <PackageCheck size={12} strokeWidth={2} />,
    order: 3,
  },
  EN_LIVRAISON: {
    label: "En cours de livraison",
    badgeClass: "badge-delivering",
    icon: <Truck size={12} strokeWidth={2} />,
    order: 4,
  },
  LIVREE: {
    label: "Livrée",
    badgeClass: "badge-delivered",
    icon: <Sparkles size={12} strokeWidth={2} />,
    order: 5,
  },
  ECHEC_LIVRAISON: {
    label: "Échec de livraison",
    badgeClass: "badge-failed",
    icon: <AlertTriangle size={12} strokeWidth={2} />,
    order: 6,
  },
};

export function getStatusMeta(status: string): StatusMeta {
  return (
    STATUS_META[status as StatutLivraison] ?? {
      label: status,
      badgeClass: "badge-pending",
      icon: <HelpCircle size={12} strokeWidth={2} />,
      order: -1,
    }
  );
}

export const LIVREUR_NEXT_STATUS: Record<string, string> = {
  AFFECTEE: "COLIS_RECUPERE",
  COLIS_RECUPERE: "EN_LIVRAISON",
  EN_LIVRAISON: "LIVREE",
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
