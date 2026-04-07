"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { clearSession, readSession, type DashboardSession } from "@/lib/dashboard/session"

type Ctx = {
  session: DashboardSession | null
  refresh: () => void
  logout: () => void
}

const DashboardSessionContext = createContext<Ctx | null>(null)

export function DashboardSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<DashboardSession | null>(null)

  const refresh = useCallback(() => {
    setSession(readSession())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
    router.replace("/login")
  }, [router])

  const value = useMemo(() => ({ session, refresh, logout }), [session, refresh, logout])

  return <DashboardSessionContext.Provider value={value}>{children}</DashboardSessionContext.Provider>
}

export function useDashboardSession() {
  const ctx = useContext(DashboardSessionContext)
  if (!ctx) throw new Error("useDashboardSession debe usarse dentro de DashboardSessionProvider")
  return ctx
}
