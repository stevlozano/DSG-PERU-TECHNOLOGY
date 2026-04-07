"use client"

import { useMemo, useState } from "react"
import { inventory, lowStockItems, type StockRow } from "@/lib/dashboard/mock-data"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

export function PageInventario() {
  const [q, setQ] = useState("")
  const [onlyLow, setOnlyLow] = useState(false)
  const low = lowStockItems()

  const rows = useMemo(() => {
    let r = inventory
    if (onlyLow) r = r.filter((x) => x.qty <= x.min)
    if (q.trim()) {
      const s = q.toLowerCase()
      r = r.filter((x) => x.sku.toLowerCase().includes(s) || x.name.toLowerCase().includes(s) || x.category.toLowerCase().includes(s))
    }
    return r
  }, [q, onlyLow])

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="SKU activos" value={String(inventory.length)} />
        <StatCard label="Bajo mínimo" value={String(low.length)} delta={{ value: "Revisar compras", positive: false }} />
        <StatCard label="Ubicaciones" value="A / B / C / V" hint="Mapa de almacén demo" />
      </div>

      <div className="flex flex-wrap items-end gap-4 border border-border/50 bg-card/20 p-4">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Buscar</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="SKU, nombre, categoría…"
            className="w-full border border-border/50 bg-background px-3 py-2 font-mono text-xs focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/20"
          />
        </div>
        <button
          type="button"
          onClick={() => setOnlyLow((v) => !v)}
          className={cn(
            "border px-4 py-2 font-mono text-[10px] uppercase tracking-wider",
            onlyLow ? "border-accent bg-accent/10 text-accent" : "border-border/50 text-muted-foreground",
          )}
        >
          Solo bajo mínimo
        </button>
      </div>

      <section className="border border-border/50 bg-card/20 p-5">
        <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight">Existencias</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-border/40 text-left text-[9px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-3">SKU</th>
                <th className="pb-3 pr-3">Producto</th>
                <th className="pb-3 pr-3">Categoría</th>
                <th className="pb-3 pr-3">Ubicación</th>
                <th className="pb-3 pr-3 text-right">Cantidad</th>
                <th className="pb-3 pr-3 text-right">Mínimo</th>
                <th className="pb-3 text-right">Lote / vcto</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: StockRow) => (
                <tr key={r.sku} className={cn("border-b border-border/20", r.qty <= r.min && "bg-amber-500/5")}>
                  <td className="py-2.5 pr-3 text-accent">{r.sku}</td>
                  <td className="max-w-[200px] truncate py-2.5 pr-3">{r.name}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{r.category}</td>
                  <td className="py-2.5 pr-3">{r.location}</td>
                  <td className="py-2.5 pr-3 text-right">{r.qty}</td>
                  <td className="py-2.5 pr-3 text-right">{r.min}</td>
                  <td className="py-2.5 text-right text-muted-foreground">
                    {r.lot ?? "—"} {r.expires ? `/ ${r.expires}` : ""}
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
