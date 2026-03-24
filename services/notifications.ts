import apiClient from "@/lib/api-client";
import type {
  DeviceRegistrationPayload,
  NotificationFilters,
  PaginatedNotifications,
  Notification,
  UserDevice,
} from "@/types/notification";

export async function registerDevice(payload: DeviceRegistrationPayload): Promise<UserDevice> {
  const response = await apiClient.post("/devices/register", payload);
  return response.data?.data;
}

export async function unregisterDevice(id: string): Promise<void> {
  await apiClient.delete(`/devices/${id}`);
}

export async function getNotifications(
  params: NotificationFilters = {},
): Promise<PaginatedNotifications> {
  const response = await apiClient.get("/notifications", { params });
  return response.data?.data ?? { items: [], total: 0, limit: 20, offset: 0 };
}

export async function getUnreadCount(): Promise<{ count: number }> {
  const response = await apiClient.get("/notifications/unread-count");
  return response.data?.data ?? { count: 0 };
}

export async function markAsRead(id: string): Promise<Notification> {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data?.data;
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.patch("/notifications/read-all");
}

export async function deleteNotification(id: string): Promise<void> {
  await apiClient.delete(`/notifications/${id}`);
}
