"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { salesByDay } from "@/lib/dashboard/mock-data"

export function SalesTrendChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={salesByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.65 0.14 168)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="oklch(0.65 0.14 168)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.35 0.04 264 / 0.35)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `S/${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 0,
              fontSize: 12,
              fontFamily: "var(--font-mono)",
            }}
            formatter={(value: number) => [`S/ ${value.toLocaleString("es-PE")}`, "Ventas"]}
          />
          <Area type="monotone" dataKey="ventas" stroke="oklch(0.55 0.14 168)" fill="url(#fillVentas)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
