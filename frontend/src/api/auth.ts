// src/api/auth.ts
import { request } from "./client";
import type { LoginResponse, RegisterFournisseurRequest } from "../types";

export const authApi = {
  login: (email: string, password?: string): Promise<LoginResponse> =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  registerFournisseur: (data: RegisterFournisseurRequest): Promise<void> =>
    request<void>("/auth/register-fournisseur", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
