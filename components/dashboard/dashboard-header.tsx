"use client"

import { usePathname } from "next/navigation"
import { Bell, Menu, Search } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { mockCompany } from "@/lib/dashboard/mock-data"
import { useDashboardSession } from "@/contexts/dashboard-session-context"

const titles: { match: string; title: string; subtitle?: string }[] = [
  { match: "/dashboard/configuracion", title: "Configuración", subtitle: "Empresa, usuarios y parámetros" },
  { match: "/dashboard/reportes", title: "Reportes", subtitle: "Exportaciones y análisis" },
  { match: "/dashboard/clientes", title: "Clientes", subtitle: "Cuentas por cobrar y segmentos" },
  { match: "/dashboard/facturacion", title: "Facturación", subtitle: "Comprobantes y estado SUNAT/OSE" },
  { match: "/dashboard/inventario", title: "Inventario", subtitle: "Stock, lotes y alertas" },
  { match: "/dashboard/ventas", title: "Ventas", subtitle: "Tickets y canales" },
  { match: "/dashboard", title: "Resumen operativo", subtitle: "KPIs y actividad reciente" },
]

function resolveTitle(path: string) {
  const sorted = [...titles].sort((a, b) => b.match.length - a.match.length)
  const row = sorted.find((t) => path === t.match || path.startsWith(`${t.match}/`))
  return row ?? titles[titles.length - 1]
}

export function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname()
  const { session } = useDashboardSession()
  const { title, subtitle } = resolveTitle(pathname)
  const [notifOpen, setNotifOpen] = useState(false)

  const notifications = [
    { id: 1, text: "6 SKU bajo stock mínimo", type: "alert" },
    { id: 2, text: "Factura F001-246 pendiente de OSE", type: "warn" },
    { id: 3, text: "Cierre de caja POS 1 registrado", type: "ok" },
  ]

  return (
    <header className="z-40 shrink-0 border-b border-border/50 bg-background/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        <button
          type="button"
          className="rounded-sm border border-border/50 p-2 text-foreground lg:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-[var(--font-bebas)] text-xl tracking-tight text-foreground md:text-2xl">{title}</h1>
          {subtitle ? <p className="truncate font-mono text-[10px] text-muted-foreground md:text-[11px]">{subtitle}</p> : null}
        </div>

        <div className="hidden max-w-xs flex-1 md:flex md:max-w-md">
          <label className="relative block w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar venta, SKU, cliente…"
              className="w-full border border-border/50 bg-background py-2 pl-9 pr-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20"
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden font-mono text-[9px] uppercase tracking-wider text-muted-foreground xl:block">
            {mockCompany.branch}
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative rounded-sm border border-border/50 p-2 text-muted-foreground hover:text-foreground"
              aria-expanded={notifOpen}
              aria-label="Notificaciones"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" />
            </button>
            {notifOpen ? (
              <div className="absolute right-0 top-full z-50 mt-2 w-72 border border-border/50 bg-popover p-2 shadow-lg">
                <p className="border-b border-border/40 px-2 pb-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  Alertas
                </p>
                <ul className="max-h-64 overflow-auto py-1">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={cn(
                        "px-2 py-2 font-mono text-xs text-foreground/90",
                        n.type === "alert" && "border-l-2 border-accent pl-3",
                        n.type === "warn" && "border-l-2 border-amber-500/80 pl-3",
                        n.type === "ok" && "border-l-2 border-border pl-3",
                      )}
                    >
                      {n.text}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="hidden h-8 w-px bg-border/50 sm:block" />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-right font-mono text-[10px] text-foreground">{session?.company ?? "—"}</p>
            <p className="truncate text-right font-mono text-[9px] text-muted-foreground">{session?.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
