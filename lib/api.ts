import type { ApiResponse } from "./types"

const API_BASE_URL = "http://localhost:8080"

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    // Get token from localStorage if available
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    // Set default headers
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    // Handle API error responses
    if (!response.ok) {
      return {
        success: false,
        data: {} as T,
        message: data.message || `Error: ${response.status} ${response.statusText}`,
      }
    }

    return data as ApiResponse<T>
  } catch (error) {
    console.error("API request failed:", error)
    return {
      success: false,
      data: {} as T,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
