export const DASHBOARD_SESSION_KEY = "dsg_dashboard_session_v1"

export type DashboardRole = "admin" | "operador" | "consulta"

export type DashboardSession = {
  name: string
  email: string
  company: string
  role: DashboardRole
  locale: "es-PE"
  lastLogin: string
}

export function parseSession(raw: string | null): DashboardSession | null {
  if (!raw) return null
  try {
    const v = JSON.parse(raw) as DashboardSession
    if (!v?.email || !v?.name) return null
    return v
  } catch {
    return null
  }
}

export function saveSession(session: DashboardSession) {
  if (typeof window === "undefined") return
  localStorage.setItem(DASHBOARD_SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  if (typeof window === "undefined") return
  localStorage.removeItem(DASHBOARD_SESSION_KEY)
}

export function readSession(): DashboardSession | null {
  if (typeof window === "undefined") return null
  return parseSession(localStorage.getItem(DASHBOARD_SESSION_KEY))
}
