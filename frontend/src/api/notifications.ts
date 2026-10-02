// src/api/notifications.ts
import { request } from "./client";
import type { Notification } from "../types";

export const notificationApi = {
  getNotifications: (unReadOnly = false): Promise<Notification[]> =>
    request<Notification[]>(`/notifications?unReadOnly=${unReadOnly}`),

  markNotificationRead: (id: string): Promise<void> =>
    request<void>(`/notifications/${id}/read`, { method: "PUT" }),
};
