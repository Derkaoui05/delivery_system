// src/types/user.ts

export type Role = "ADMIN" | "FOURNISSEUR" | "LIVREUR";

export type Disponibilite = "DISPONIBLE" | "EN_LIVRAISON" | "INDISPONIBLE";

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface Livreur {
  id: string;
  email: string;
  nom: string;
  telephone: string;
  adresse: string;
  ville: string;
  disponibilite: Disponibilite | string;
  active: boolean;
  createdAt?: string;
}

export interface Fournisseur {
  id: string;
  email: string;
  raisonSociale: string;
  responsable: string;
  telephone: string;
  adresse: string;
  ville: string;
  active: boolean;
  createdAt: string;
}

export interface RegisterLivreurRequest {
  email: string;
  password?: string;
  nom: string;
  telephone: string;
  adresse: string;
  ville: string;
}

export interface UpdateLivreurRequest {
  nom: string;
  telephone: string;
  adresse: string;
  ville: string;
  active?: boolean;
}

export interface RegisterFournisseurRequest {
  email: string;
  password?: string;
  raisonSociale: string;
  responsable: string;
  telephone: string;
  adresse: string;
  ville: string;
}

export interface UpdateFournisseurRequest {
  raisonSociale: string;
  responsable: string;
  telephone: string;
  adresse: string;
  ville: string;
  active?: boolean;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  role: Role;
  userId?: string;
  email?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

