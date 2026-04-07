import { cn } from "@/lib/utils"

export function PageHeader({
  kicker,
  title,
  description,
  className,
}: {
  kicker: string
  title: string
  description?: string
  className?: string
}) {
  return (
    <header className={cn("mb-16 border-b border-border/40 pb-12", className)}>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{kicker}</span>
      <h1 className="mt-4 font-[var(--font-bebas)] text-5xl tracking-tight md:text-7xl lg:text-8xl">{title}</h1>
      {description ? (
        <p className="mt-8 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </header>
  )
}
