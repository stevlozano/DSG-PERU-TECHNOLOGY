import type { Metadata } from "next"
import Link from "next/link"
import { MainNavbar } from "@/components/main-navbar"
import { SitePageShell } from "@/components/site-page-shell"
import { SiteFooter } from "@/components/site-footer"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Nosotros — DSG Peru Technology",
  description:
    "Conoce a DSG Peru Technology: consultoría en programación y sistemas de gestión para empresas en Perú.",
}

const pillars = [
  {
    n: "01",
    title: "Origen",
    text: "Empresa peruana activa desde 2021, con enfoque en consultoría de programación y suministro informático para PYMES y medianas empresas.",
  },
  {
    n: "02",
    title: "Propósito",
    text: "Digitalizar operaciones reales: ventas, inventarios, facturación y reportes, sin sacrificar claridad para el equipo en tienda u oficina.",
  },
  {
    n: "03",
    title: "Alcance",
    text: "Trabajamos con distintos giros y RUC: farmacias, veterinarias, comercio, distribución y más, adaptando parámetros y flujos a cada caso.",
  },
]

export default function NosotrosPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <MainNavbar />
      <SitePageShell>
        <PageHeader
          kicker="Empresa"
          title="NOSOTROS"
          description="DSG Peru Technology S.R.L. diseña e implementa sistemas de gestión alineados a la operación peruana: cumplimiento, velocidad en caja y trazabilidad de stock."
        />

        <div className="grid gap-12 md:gap-20">
          {pillars.map((p) => (
            <article key={p.n} className="border-t border-border/30 pt-10 md:grid md:grid-cols-12 md:gap-8 md:pt-12">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:col-span-2">
                {p.n}
              </span>
              <div className="mt-4 md:col-span-6 md:mt-0">
                <h2 className="font-[var(--font-bebas)] text-3xl tracking-tight md:text-5xl">{p.title}</h2>
                <p className="mt-6 font-mono text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-24 border border-border/50 bg-card/15 p-8 md:mt-32 md:p-12">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Datos</span>
          <dl className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Razón social</dt>
              <dd className="mt-2 font-mono text-sm text-foreground/90">DSG Peru Technology S.R.L.</dd>
            </div>
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">RUC</dt>
              <dd className="mt-2 font-mono text-sm text-foreground/90">20607209180</dd>
            </div>
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Ubicación</dt>
              <dd className="mt-2 font-mono text-sm text-foreground/90">Ucayali, Perú</dd>
            </div>
          </dl>
        </div>

        <p className="mt-16 font-mono text-sm text-muted-foreground">
          ¿Quieres ver soluciones concretas?{" "}
          <Link href="/tienda" className="text-accent underline-offset-4 hover:underline">
            Ir a la tienda
          </Link>
        </p>
      </SitePageShell>
      <SiteFooter />
    </main>
  )
}
