"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDashboardSession } from "@/contexts/dashboard-session-context"
import { useState } from "react"

const nav = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard, end: true },
  { href: "/dashboard/ventas", label: "Ventas", icon: ShoppingCart },
  { href: "/dashboard/inventario", label: "Inventario", icon: Package },
  { href: "/dashboard/facturacion", label: "Facturación", icon: FileText },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/dashboard/configuracion", label: "Configuración", icon: Settings },
] as const

export function DashboardSidebar() {
  const pathname = usePathname()
  const { session, logout } = useDashboardSession()
  const [collapsed, setCollapsed] = useState(false)

  const active = (href: string, end?: boolean) => {
    if (end) return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col border-r border-border/50 bg-card/40 backdrop-blur-sm transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-56 lg:w-60",
      )}
    >
      <div className="flex h-14 items-center border-b border-border/40 px-3">
        <Link
          href="/dashboard"
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 font-[var(--font-bebas)] text-lg tracking-wide text-foreground",
            collapsed && "justify-center",
          )}
        >
          <span className="text-accent">DSG</span>
          {!collapsed && <span className="truncate text-muted-foreground">Panel</span>}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="hidden rounded-sm border border-border/50 p-1.5 text-muted-foreground hover:text-foreground lg:block"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="scrollbar-invisible flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2" aria-label="Módulos">
        {nav.map(({ href, label, icon: Icon, end }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-sm px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
              active(href, end)
                ? "border border-accent/30 bg-accent/10 text-accent"
                : "border border-transparent text-muted-foreground hover:border-border/50 hover:bg-muted/30 hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border/40 p-2">
        <div
          className={cn(
            "mb-2 rounded-sm border border-border/40 bg-background/50 px-3 py-2",
            collapsed && "px-2",
          )}
        >
          {!collapsed && session ? (
            <>
              <p className="truncate font-mono text-[10px] font-medium uppercase tracking-wide text-foreground">
                {session.name}
              </p>
              <p className="truncate font-mono text-[9px] text-muted-foreground">{session.role}</p>
            </>
          ) : null}
          {collapsed && session ? (
            <div className="flex justify-center font-mono text-[10px] text-accent" title={session.name}>
              {session.name.slice(0, 2).toUpperCase()}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-sm px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          {!collapsed && "Cerrar sesión"}
        </button>
      </div>
    </aside>
  )
}
