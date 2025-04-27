import { fetchApi } from "./api"
import type { ApiResponse, Group, CreateGroupData, User } from "./types"

export async function getGroups(): Promise<ApiResponse<Group[]>> {
  return fetchApi<Group[]>("/api/groups")
}

export async function getGroupById(groupId: string): Promise<ApiResponse<Group>> {
  return fetchApi<Group>(`/api/groups/${groupId}`)
}

export async function createGroup(groupData: CreateGroupData): Promise<ApiResponse<{ id: string }>> {
  return fetchApi<{ id: string }>("/api/groups", {
    method: "POST",
    body: JSON.stringify(groupData),
  })
}

export async function joinGroup(groupId: string, username: string): Promise<ApiResponse<{ joined: boolean }>> {
  return fetchApi<{ joined: boolean }>(`/api/groups/${groupId}/join`, {
    method: "POST",
    body: JSON.stringify({ username }),
  })
}

export async function leaveGroup(groupId: string, username: string): Promise<ApiResponse<{ joined: boolean }>> {
  return fetchApi<{ joined: boolean }>(`/api/groups/${groupId}/leave`, {
    method: "POST",
    body: JSON.stringify({ username }),
  })
}

export async function searchUsers(query: string): Promise<ApiResponse<User[]>> {
  return fetchApi<User[]>(`/api/users/search?q=${encodeURIComponent(query)}`)
}

export async function addMemberToGroup(groupId: string, username: string): Promise<ApiResponse<{}>> {
  return fetchApi<{}>(`/api/groups/${groupId}/members`, {
    method: "POST",
    body: JSON.stringify({ username }),
  })
}

export async function removeMemberFromGroup(groupId: string, username: string): Promise<ApiResponse<{}>> {
  return fetchApi<{}>(`/api/groups/${groupId}/members/${username}`, {
    method: "DELETE",
  })
}

export async function getGroupMembers(groupId: string): Promise<ApiResponse<User[]>> {
  return fetchApi<User[]>(`/api/groups/${groupId}/members`)
}
