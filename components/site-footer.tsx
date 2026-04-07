import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border/30 px-6 py-10 md:pl-28 md:pr-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          © {new Date().getFullYear()} DSG Peru Technology S.R.L.
        </p>
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <Link
            href="/asistencia"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
          >
            Asistencia DSG
          </Link>
          <Link
            href="/"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </footer>
  )
}
