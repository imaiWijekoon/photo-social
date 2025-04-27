import { fetchApi } from "./api"
import type { ApiResponse, Notification } from "./types"

export async function getUserNotifications(username: string): Promise<ApiResponse<Notification[]>> {
  return fetchApi<Notification[]>(`/api/notifications/user/${username}`)
}

export async function markNotificationAsRead(notificationId: string): Promise<ApiResponse<{}>> {
  return fetchApi<{}>(`/api/notifications/${notificationId}/read`, {
    method: "POST",
  })
}
