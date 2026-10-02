// src/api/index.ts
import { authApi } from "./auth";
import { adminApi } from "./admin";
import { fournisseurApi } from "./fournisseur";
import { livreurApi } from "./livreur";
import { notificationApi } from "./notifications";

export * from "./client";
export * from "./auth";
export * from "./admin";
export * from "./fournisseur";
export * from "./livreur";
export * from "./notifications";

export const api = {
  ...authApi,
  ...adminApi,
  ...fournisseurApi,
  ...livreurApi,
  ...notificationApi,
};

export default api;
