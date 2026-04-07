"use client"

import { useState } from "react"
import { mockCompany } from "@/lib/dashboard/mock-data"
import { useDashboardSession } from "@/contexts/dashboard-session-context"
import { cn } from "@/lib/utils"

export function PageConfiguracion() {
  const { session } = useDashboardSession()
  const [toggles, setToggles] = useState({
    ose: true,
    stockNeg: false,
    priceList: true,
    backup: true,
  })

  return (
    <div className="space-y-10 p-4 md:p-6 lg:p-8">
      <section className="border border-border/50 bg-card/20 p-6">
        <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight">Empresa</h2>
        <p className="mb-6 font-mono text-[10px] text-muted-foreground">Datos maestros (solo lectura en demo)</p>
        <dl className="grid gap-4 font-mono text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[9px] uppercase tracking-wider text-muted-foreground">Razón social</dt>
            <dd className="mt-1 text-foreground/90">{mockCompany.name}</dd>
          </div>
          <div>
            <dt className="text-[9px] uppercase tracking-wider text-muted-foreground">RUC</dt>
            <dd className="mt-1 text-foreground/90">{mockCompany.ruc}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[9px] uppercase tracking-wider text-muted-foreground">Sede</dt>
            <dd className="mt-1 text-foreground/90">{mockCompany.branch}</dd>
          </div>
        </dl>
      </section>

      <section className="border border-border/50 bg-card/20 p-6">
        <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight">Tu sesión</h2>
        <dl className="mt-4 grid gap-3 font-mono text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[9px] uppercase tracking-wider text-muted-foreground">Usuario</dt>
            <dd className="mt-1">{session?.name}</dd>
          </div>
          <div>
            <dt className="text-[9px] uppercase tracking-wider text-muted-foreground">Correo</dt>
            <dd className="mt-1 text-muted-foreground">{session?.email}</dd>
          </div>
          <div>
            <dt className="text-[9px] uppercase tracking-wider text-muted-foreground">Rol</dt>
            <dd className="mt-1 text-accent">{session?.role}</dd>
          </div>
        </dl>
      </section>

      <section className="border border-border/50 bg-card/20 p-6">
        <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight">Parámetros operativos</h2>
        <p className="mb-6 font-mono text-[10px] text-muted-foreground">
          Interruptores de demostración — en backend gobernarían reglas de negocio
        </p>
        <ul className="space-y-4">
          {(
            [
              { key: "ose" as const, label: "Validación OSE automática", desc: "Reintentos y anexos XML" },
              { key: "stockNeg" as const, label: "Permitir stock negativo", desc: "Solo con rol admin" },
              { key: "priceList" as const, label: "Listas de precios múltiples", desc: "Mayorista / público" },
              { key: "backup" as const, label: "Respaldo nocturno", desc: "Snapshot de BD" },
            ] as const
          ).map((row) => (
            <li key={row.key} className="flex flex-wrap items-start justify-between gap-4 border-b border-border/30 pb-4 last:border-0">
              <div>
                <p className="font-mono text-xs font-medium text-foreground">{row.label}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{row.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={toggles[row.key]}
                onClick={() => setToggles((t) => ({ ...t, [row.key]: !t[row.key] }))}
                className={cn(
                  "relative h-7 w-12 shrink-0 border transition-colors",
                  toggles[row.key] ? "border-accent bg-accent/20" : "border-border/60 bg-muted/20",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 border border-border/50 bg-background transition-transform",
                    toggles[row.key] ? "left-6" : "left-0.5",
                  )}
                />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
