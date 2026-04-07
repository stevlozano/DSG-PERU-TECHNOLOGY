"use client"

import Link from "next/link"
import { ArrowRight, Package, Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { SalesTrendChart } from "@/components/dashboard/charts/sales-trend-chart"
import { TicketsBarChart } from "@/components/dashboard/charts/tickets-bar-chart"
import {
  activityLog,
  formatPEN,
  kpi,
  lowStockItems,
  recentSales,
  topProducts,
} from "@/lib/dashboard/mock-data"

export function DashboardOverview() {
  const low = lowStockItems()

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ventas hoy"
          value={formatPEN(kpi.salesToday)}
          delta={{ value: `${kpi.salesTodayDelta > 0 ? "+" : ""}${kpi.salesTodayDelta}% vs ayer`, positive: kpi.salesTodayDelta > 0 }}
          icon={kpi.salesTodayDelta >= 0 ? TrendingUp : TrendingDown}
        />
        <StatCard
          label="Ventas del mes"
          value={formatPEN(kpi.salesMonth)}
          delta={{ value: `${kpi.salesMonthDelta > 0 ? "+" : ""}${kpi.salesMonthDelta}% vs mes ant.`, positive: kpi.salesMonthDelta > 0 }}
          icon={Wallet}
        />
        <StatCard
          label="Tickets hoy"
          value={String(kpi.ticketsToday)}
          delta={{ value: `${kpi.ticketsDelta > 0 ? "+" : ""}${kpi.ticketsDelta}% vs promedio`, positive: true }}
          hint="Canal principal: POS"
          icon={Receipt}
        />
        <StatCard
          label="Alertas stock"
          value={String(low.length)}
          hint="SKU bajo mínimo"
          delta={{ value: low.length > 0 ? "Requiere compras" : "OK", positive: low.length === 0 }}
          icon={Package}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="border border-border/50 bg-card/20 p-5 lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight text-foreground">Tendencia de ventas</h2>
              <p className="font-mono text-[10px] text-muted-foreground">Últimos 7 días — todos los canales</p>
            </div>
            <Link
              href="/dashboard/reportes"
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-accent hover:underline"
            >
              Ver reportes <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <SalesTrendChart />
        </section>
        <section className="border border-border/50 bg-card/20 p-5 lg:col-span-2">
          <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight text-foreground">Tickets por día</h2>
          <p className="mb-4 font-mono text-[10px] text-muted-foreground">Volumen operativo en caja</p>
          <TicketsBarChart />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="border border-border/50 bg-card/20 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight">Ventas recientes</h2>
            <Link href="/dashboard/ventas" className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
              Ir a ventas
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-border/40 text-left text-[9px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-3">Documento</th>
                  <th className="pb-3 pr-3">Hora</th>
                  <th className="pb-3 pr-3">Canal</th>
                  <th className="pb-3 pr-3">Cliente</th>
                  <th className="pb-3 pr-3 text-right">Total</th>
                  <th className="pb-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((r) => (
                  <tr key={r.id} className="border-b border-border/20 text-foreground/90">
                    <td className="py-2.5 pr-3 text-accent">{r.id}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{r.time.split(" ")[1]}</td>
                    <td className="py-2.5 pr-3">{r.channel}</td>
                    <td className="max-w-[120px] truncate py-2.5 pr-3">{r.customer}</td>
                    <td className="py-2.5 pr-3 text-right">{formatPEN(r.total)}</td>
                    <td className="py-2.5 text-right">
                      <span
                        className={
                          r.status === "Pagado"
                            ? "text-accent"
                            : r.status === "Pendiente"
                              ? "text-amber-600 dark:text-amber-500"
                              : "text-muted-foreground line-through"
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border border-border/50 bg-card/20 p-5">
          <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight">Top SKU</h2>
          <p className="mb-4 font-mono text-[10px] text-muted-foreground">Por facturación — período actual</p>
          <ul className="space-y-4">
            {topProducts.map((p, i) => (
              <li key={p.sku} className="flex gap-3 border-b border-border/20 pb-3 last:border-0">
                <span className="font-[var(--font-bebas)] text-xl text-muted-foreground/50">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[11px] font-medium text-foreground">{p.name}</p>
                  <p className="font-mono text-[9px] text-muted-foreground">{p.sku}</p>
                  <p className="mt-1 font-mono text-[10px] text-accent">{formatPEN(p.revenue)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-border/50 bg-card/20 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight">Stock crítico</h2>
            <Link href="/dashboard/inventario" className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
              Inventario
            </Link>
          </div>
          <ul className="space-y-2">
            {low.slice(0, 5).map((item) => (
              <li key={item.sku} className="flex items-center justify-between border border-border/30 bg-background/40 px-3 py-2 font-mono text-xs">
                <span className="truncate pr-2">
                  <span className="text-accent">{item.sku}</span> — {item.name}
                </span>
                <span className="shrink-0 text-amber-600 dark:text-amber-500">
                  {item.qty} / mín {item.min}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-border/50 bg-card/20 p-5">
          <h2 className="font-[var(--font-bebas)] text-2xl tracking-tight">Actividad</h2>
          <p className="mb-4 font-mono text-[10px] text-muted-foreground">Bitácora del día</p>
          <ul className="space-y-3">
            {activityLog.map((a) => (
              <li key={a.id} className="flex gap-3 font-mono text-xs">
                <span className="w-10 shrink-0 text-muted-foreground">{a.time}</span>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-accent">{a.user}</span>
                  <p className="text-foreground/90">{a.action}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
