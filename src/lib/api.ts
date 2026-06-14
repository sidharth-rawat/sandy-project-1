// Thin client over the backend REST API.
// The wire format is always { success, message, data } | { success, message, errors }.
// On success we resolve with `data`; on failure we throw an ApiError carrying the
// server message so forms can surface it.

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5001/api"

const ACCESS_KEY = "sandy.accessToken"
const REFRESH_KEY = "sandy.refreshToken"

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export class ApiError extends Error {
  status: number
  errors?: unknown

  constructor(message: string, status: number, errors?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
  }
}

type RequestOptions = {
  method?: string
  body?: unknown
  auth?: boolean
  // internal: prevents infinite refresh loops
  _retried?: boolean
}

// Attempts to rotate the access token using the stored refresh token.
// Returns true if a fresh access token is now available.
async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  const res = await fetch(`${API_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    clearTokens()
    return false
  }

  const json = await res.json()
  setTokens(json.data.accessToken, json.data.refreshToken)
  return true
}

export async function api<T = unknown>(
  path: string,
  { method = "GET", body, auth = true, _retried = false }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers["Content-Type"] = "application/json"

  if (auth) {
    const token = getAccessToken()
    if (token) headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Transparently refresh once on an expired access token, then retry.
  if (res.status === 401 && auth && !_retried) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      return api<T>(path, { method, body, auth, _retried: true })
    }
  }

  let json: { success: boolean; message?: string; data?: T; errors?: unknown }
  try {
    json = await res.json()
  } catch {
    throw new ApiError("Unexpected server response", res.status)
  }

  if (!res.ok || !json.success) {
    throw new ApiError(json.message || "Request failed", res.status, json.errors)
  }

  return json.data as T
}
