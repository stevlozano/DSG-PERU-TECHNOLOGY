import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export function StatCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
  className,
}: {
  label: string
  value: string
  hint?: string
  delta?: { value: string; positive?: boolean }
  icon?: LucideIcon
  className?: string
}) {
  return (
    <div
      className={cn(
        "border border-border/50 bg-card/30 p-5 transition-colors hover:border-border",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-accent/80" strokeWidth={1.5} /> : null}
      </div>
      <p className="mt-3 font-[var(--font-bebas)] text-3xl tracking-tight text-foreground md:text-4xl">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {delta ? (
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-wider",
              delta.positive === true && "text-accent",
              delta.positive === false && "text-amber-600 dark:text-amber-500",
              delta.positive === undefined && "text-muted-foreground",
            )}
          >
            {delta.value}
          </span>
        ) : null}
        {hint ? <span className="font-mono text-[10px] text-muted-foreground">{hint}</span> : null}
      </div>
    </div>
  )
}
