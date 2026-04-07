"use client"

import { invoices, kpi, formatPEN } from "@/lib/dashboard/mock-data"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

export function PageFacturacion() {
  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Comprobantes hoy (demo)" value={String(invoices.length)} />
        <StatCard label="Pendientes OSE" value={String(kpi.pendingInvoices)} hint="Reintentos automáticos" />
        <StatCard label="Por cobrar" value={formatPEN(kpi.receivables)} />
      </div>

      <section className="border border-border/50 bg-card/20 p-5">
        <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight">Últimos comprobantes</h2>
        <p className="mb-4 font-mono text-[10px] text-muted-foreground">Estado tributario simulado — integración SUNAT/OSE</p>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-border/40 text-left text-[9px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-3">Número</th>
                <th className="pb-3 pr-3">Tipo</th>
                <th className="pb-3 pr-3">Cliente</th>
                <th className="pb-3 pr-3">RUC</th>
                <th className="pb-3 pr-3">Fecha</th>
                <th className="pb-3 pr-3 text-right">Importe</th>
                <th className="pb-3 text-right">OSE / SUNAT</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/20">
                  <td className="py-2.5 pr-3 text-accent">{inv.id}</td>
                  <td className="py-2.5 pr-3">{inv.type}</td>
                  <td className="max-w-[160px] truncate py-2.5 pr-3">{inv.customer}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{inv.ruc}</td>
                  <td className="py-2.5 pr-3">{inv.date}</td>
                  <td className="py-2.5 pr-3 text-right">{formatPEN(inv.amount)}</td>
                  <td className="py-2.5 text-right">
                    <span
                      className={cn(
                        "inline-block border px-2 py-0.5 text-[10px] uppercase tracking-wide",
                        inv.sunat === "Aceptado" && "border-accent/40 text-accent",
                        inv.sunat === "Pendiente" && "border-amber-500/50 text-amber-600 dark:text-amber-500",
                        inv.sunat === "Rechazado" && "border-destructive/40 text-destructive",
                      )}
                    >
                      {inv.sunat}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
