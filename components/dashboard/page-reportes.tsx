"use client"

import { useState } from "react"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { topProducts, salesByDay, formatPEN } from "@/lib/dashboard/mock-data"
import { StatCard } from "@/components/dashboard/stat-card"

const COLORS = [
  "oklch(0.55 0.14 168)",
  "oklch(0.5 0.16 262)",
  "oklch(0.6 0.12 45)",
  "oklch(0.55 0.08 264)",
]

const pieData = topProducts.map((p) => ({ name: p.sku, value: p.revenue }))

export function PageReportes() {
  const [msg, setMsg] = useState<string | null>(null)

  const fakeExport = (kind: string) => {
    setMsg(`En producción: generación ${kind} (Excel/PDF) vía API.`)
    setTimeout(() => setMsg(null), 3500)
  }

  const totalWeek = salesByDay.reduce((s, d) => s + d.ventas, 0)

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Ventas 7 días (demo)" value={formatPEN(totalWeek)} />
        <StatCard label="Informes programados" value="0" hint="Activar en configuración" />
        <StatCard label="Última exportación" value="—" />
      </div>

      {msg ? (
        <p className="border border-accent/30 bg-accent/5 px-4 py-3 font-mono text-xs text-foreground">{msg}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => fakeExport("ventas detalladas")}
          className="border border-border/50 bg-card/30 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-foreground hover:border-accent/40"
        >
          Exportar ventas
        </button>
        <button
          type="button"
          onClick={() => fakeExport("inventario valorizado")}
          className="border border-border/50 bg-card/30 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-foreground hover:border-accent/40"
        >
          Exportar inventario
        </button>
        <button
          type="button"
          onClick={() => fakeExport("libro de compras")}
          className="border border-border/50 bg-card/30 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-foreground hover:border-accent/40"
        >
          Libro compras / ventas
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-border/50 bg-card/20 p-5">
          <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight">Mix por SKU (ingresos)</h2>
          <p className="mb-2 font-mono text-[10px] text-muted-foreground">Distribución aproximada del período</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={56} outerRadius={88} paddingAngle={2}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="var(--background)" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatPEN(v)}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="border border-border/50 bg-card/20 p-5">
          <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight">Cuadro resumen</h2>
          <p className="mb-4 font-mono text-[10px] text-muted-foreground">Mismos datos que el resumen — listo para cruzar con contabilidad</p>
          <ul className="space-y-3 font-mono text-xs">
            {topProducts.map((p) => (
              <li key={p.sku} className="flex justify-between border-b border-border/30 py-2">
                <span className="text-muted-foreground">{p.name}</span>
                <span className="text-accent">{formatPEN(p.revenue)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
