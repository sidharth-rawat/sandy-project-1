import { api, clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/api"

export type Profile = {
  _id: string
  name: string
  email: string
  phone: string
  referralCode?: string
  dividendPercentage?: number
  createdAt?: string
}

export function isLoggedIn(): boolean {
  return getAccessToken() !== null
}

type RegisterInput = {
  name: string
  email: string
  phone: string
  password: string
  referralCode?: string
}

export async function register(
  input: RegisterInput
): Promise<{ userId: string; referralCode: string }> {
  return api("/auth/register", { method: "POST", body: input, auth: false })
}

export async function verifyEmail(email: string, code: string): Promise<void> {
  await api("/auth/verify", { method: "POST", body: { email, code }, auth: false })
}

export async function login(email: string, password: string): Promise<void> {
  const data = await api<{ accessToken: string; refreshToken: string }>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  })
  setTokens(data.accessToken, data.refreshToken)
}

export async function getProfile(): Promise<Profile> {
  const data = await api<{ user: Profile }>("/user/profile")
  return data.user
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken()
  try {
    await api("/auth/logout", { method: "POST", body: { refreshToken }, auth: false })
  } catch {
    // best-effort; clear the local session regardless
  }
  clearTokens()
}
