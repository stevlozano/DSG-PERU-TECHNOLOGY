"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { readSession } from "@/lib/dashboard/session"
import { DashboardSessionProvider } from "@/contexts/dashboard-session-context"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { cn } from "@/lib/utils"

function DashboardGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const s = readSession()
    if (!s) {
      router.replace("/login?next=/dashboard")
      setAllowed(false)
    } else {
      setAllowed(true)
    }
    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded-sm border-2 border-accent/40 border-t-transparent" />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Cargando panel…</p>
        </div>
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <p className="font-mono text-sm text-muted-foreground">Redirigiendo al inicio de sesión…</p>
        <Link href="/login" className="font-mono text-xs uppercase tracking-widest text-accent underline-offset-4 hover:underline">
          Ir a login
        </Link>
      </div>
    )
  }

  return <>{children}</>
}

function DashboardChrome({ children }: { children: React.ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false)

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
      {/* Sidebar: altura fija al viewport; en desktop no se mueve con el scroll del contenido */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh shrink-0 flex-col transition-transform duration-200 lg:relative lg:z-0 lg:shrink-0 lg:translate-x-0",
          mobileNav ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <DashboardSidebar />
      </div>
      {mobileNav ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-background/60 lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setMobileNav(false)}
        />
      ) : null}
      {/* Columna principal: solo esta zona hace scroll; barra oculta */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setMobileNav(true)} />
        <main className="scrollbar-invisible min-h-0 flex-1 overflow-y-scroll overflow-x-hidden overscroll-contain">
          {children}
        </main>
      </div>
    </div>
  )
}

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <DashboardSessionProvider>
      <DashboardGate>
        <DashboardChrome>{children}</DashboardChrome>
      </DashboardGate>
    </DashboardSessionProvider>
  )
}
