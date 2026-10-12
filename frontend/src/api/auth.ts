// src/api/auth.ts
import { request } from "./client";
import type { 
  LoginResponse, 
  RegisterFournisseurRequest, 
  RegisterLivreurRequest,
  ResetPasswordRequest, 
  ChangePasswordRequest 
} from "../types";

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

  registerLivreur: (data: RegisterLivreurRequest): Promise<void> =>
    request<void>("/auth/register-livreur", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  forgotPassword: (email: string): Promise<{ message: string; resetToken?: string }> =>
    request<{ message: string; resetToken?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (data: ResetPasswordRequest): Promise<{ message: string }> =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  changePassword: (data: ChangePasswordRequest): Promise<{ message: string }> =>
    request<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
