import { fetchApi } from "./api"
import type { ApiResponse } from "./types"

interface LoginResponse {
  token: string
}

interface RegisterResponse {
  message: string
}

interface ValidateResponse {
  username: string
}

export async function login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
  return fetchApi<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  })
}

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<ApiResponse<RegisterResponse>> {
  return fetchApi<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  })
}

export async function validateToken(): Promise<ApiResponse<ValidateResponse>> {
  return fetchApi<ValidateResponse>("/api/auth/validate")
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("token")
}

export function getUsername(): string | null {
  if (typeof window === "undefined") return null

  try {
    const token = localStorage.getItem("token")
    if (!token) return null

    // Decode JWT token to get username
    // This is a simple implementation - in production, you might want to validate the token properly
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.sub || null
  } catch (error) {
    console.error("Error decoding token:", error)
    return null
  }
}

export function logout(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
}
