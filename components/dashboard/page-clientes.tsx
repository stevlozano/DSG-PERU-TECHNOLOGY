"use client"

import { useMemo, useState } from "react"
import { customers, formatPEN, type CustomerRow } from "@/lib/dashboard/mock-data"
import { StatCard } from "@/components/dashboard/stat-card"
import { cn } from "@/lib/utils"

export function PageClientes() {
  const [segment, setSegment] = useState<string>("Todos")

  const rows = useMemo(() => {
    if (segment === "Todos") return customers
    return customers.filter((c) => c.segment === segment)
  }, [segment])

  const totalBalance = useMemo(() => rows.reduce((s, c) => s + c.balance, 0), [rows])

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Clientes activos" value={String(customers.length)} />
        <StatCard label="Cartera (saldo demo)" value={formatPEN(totalBalance)} />
        <StatCard label="Segmentos" value="3" hint="Mayorista · Minorista · Corp." />
      </div>

      <div className="flex flex-wrap gap-2 border border-border/50 bg-card/20 p-4">
        <span className="self-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Segmento</span>
        {(["Todos", "Mayorista", "Minorista", "Corporativo"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSegment(s)}
            className={cn(
              "border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider",
              segment === s ? "border-accent bg-accent/10 text-accent" : "border-border/50 text-muted-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <section className="border border-border/50 bg-card/20 p-5">
        <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight">Cuentas</h2>
        <p className="mb-4 font-mono text-[10px] text-muted-foreground">RUC, último pedido y saldo pendiente</p>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-border/40 text-left text-[9px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-3">Código</th>
                <th className="pb-3 pr-3">Razón social</th>
                <th className="pb-3 pr-3">RUC</th>
                <th className="pb-3 pr-3">Segmento</th>
                <th className="pb-3 pr-3">Último pedido</th>
                <th className="pb-3 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c: CustomerRow) => (
                <tr key={c.id} className="border-b border-border/20">
                  <td className="py-2.5 pr-3 text-accent">{c.id}</td>
                  <td className="max-w-[200px] truncate py-2.5 pr-3">{c.name}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{c.ruc}</td>
                  <td className="py-2.5 pr-3">{c.segment}</td>
                  <td className="py-2.5 pr-3">{c.lastOrder}</td>
                  <td className={cn("py-2.5 text-right", c.balance > 0 && "text-amber-600 dark:text-amber-500")}>
                    {formatPEN(c.balance)}
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
