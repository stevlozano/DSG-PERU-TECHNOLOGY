"use client"

import { useMemo, useState } from "react"
import { formatPEN, recentSales, type SaleRow } from "@/lib/dashboard/mock-data"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

const channels = ["Todos", "POS", "Web", "Delivery"] as const

export function PageVentas() {
  const [channel, setChannel] = useState<(typeof channels)[number]>("Todos")
  const [status, setStatus] = useState<string>("Todos")

  const filtered = useMemo(() => {
    return recentSales.filter((r) => {
      if (channel !== "Todos" && r.channel !== channel) return false
      if (status !== "Todos" && r.status !== status) return false
      return true
    })
  }, [channel, status])

  const total = useMemo(() => filtered.filter((r) => r.status === "Pagado").reduce((s, r) => s + r.total, 0), [filtered])

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Ventas filtradas (demo)" value={formatPEN(total)} hint={`${filtered.length} documentos`} />
        <StatCard label="Ticket promedio" value={filtered.length ? formatPEN(total / filtered.length) : "—"} />
        <StatCard label="Pendientes de cobro" value={String(recentSales.filter((r) => r.status === "Pendiente").length)} />
      </div>

      <div className="flex flex-wrap items-center gap-3 border border-border/50 bg-card/20 p-4">
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Canal</span>
        <div className="flex flex-wrap gap-1">
          {channels.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChannel(c)}
              className={cn(
                "border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors",
                channel === c ? "border-accent bg-accent/10 text-accent" : "border-border/50 text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <span className="ml-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Estado</span>
        {(["Todos", "Pagado", "Pendiente", "Anulado"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={cn(
              "border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors",
              status === s ? "border-accent bg-accent/10 text-accent" : "border-border/50 text-muted-foreground hover:text-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <section className="border border-border/50 bg-card/20 p-5">
        <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight">Listado de ventas</h2>
        <p className="mb-4 font-mono text-[10px] text-muted-foreground">
          Vista operativa — en producción se paginaría y consultaría al servidor
        </p>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-border/40 text-left text-[9px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-3">Documento</th>
                <th className="pb-3 pr-3">Fecha / hora</th>
                <th className="pb-3 pr-3">Canal</th>
                <th className="pb-3 pr-3">Cliente</th>
                <th className="pb-3 pr-3 text-right">Ítems</th>
                <th className="pb-3 pr-3 text-right">Total</th>
                <th className="pb-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: SaleRow) => (
                <tr key={r.id} className="border-b border-border/20">
                  <td className="py-2.5 pr-3 text-accent">{r.id}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{r.time}</td>
                  <td className="py-2.5 pr-3">{r.channel}</td>
                  <td className="max-w-[140px] truncate py-2.5 pr-3">{r.customer}</td>
                  <td className="py-2.5 pr-3 text-right">{r.items}</td>
                  <td className="py-2.5 pr-3 text-right">{formatPEN(r.total)}</td>
                  <td className="py-2.5 text-right text-muted-foreground">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
