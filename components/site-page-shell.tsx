import { cn } from "@/lib/utils"

export function SitePageShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30" aria-hidden>
        <div className="grid-bg h-full w-full" />
      </div>
      <div className={cn("relative z-10 min-h-[calc(100dvh-3.5rem)] pt-14 pb-20 pl-6 md:pl-28 pr-6 md:pr-12", className)}>
        {children}
      </div>
    </>
  )
}
