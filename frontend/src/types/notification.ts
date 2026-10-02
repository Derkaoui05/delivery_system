// src/types/notification.ts

export type NotificationType =
  | "LIVRAISON_CREEE"
  | "LIVRAISON_VALIDEE"
  | "LIVRAISON_AFFECTEE"
  | "STATUT_CHANGE"
  | string;

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  type?: NotificationType;
  createdAt: string;
  livraison?: {
    id?: string;
    reference?: string;
  };
}
