import type { Metadata } from "next"
import Link from "next/link"
import { MainNavbar } from "@/components/main-navbar"
import { SitePageShell } from "@/components/site-page-shell"
import { SiteFooter } from "@/components/site-footer"
import { PageHeader } from "@/components/page-header"
import { DemoRequestForm } from "@/components/demo-request-form"

export const metadata: Metadata = {
  title: "Demo — DSG Peru Technology",
  description: "Solicita una demostración guiada de nuestros sistemas de gestión según tu rubro en Perú.",
}

const steps = [
  "Recibimos tu solicitud con rubro y datos de contacto.",
  "Coordinamos fecha y modalidad (remoto o presencial según zona).",
  "Te mostramos flujos de venta, stock y reportes aplicados a tu caso.",
]

export default function DemoPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <MainNavbar />
      <SitePageShell>
        <PageHeader
          kicker="Demostración"
          title="DEMO"
          description="Agenda una sesión para ver el sistema en acción: pantallas reales de venta, inventario y facturación adaptadas a farmacias, veterinarias, retail y otros rubros."
        />

        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Proceso</span>
            <ol className="mt-8 space-y-8">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-6 border-l border-border/50 pl-6">
                  <span className="font-[var(--font-bebas)] text-2xl text-muted-foreground/50 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-mono text-sm leading-relaxed text-muted-foreground">{s}</p>
                </li>
              ))}
            </ol>
            <p className="mt-12 font-mono text-xs text-muted-foreground">
              ¿Solo una consulta rápida?{" "}
              <Link href="/contacto" className="text-accent underline-offset-4 hover:underline">
                Usa contacto
              </Link>
              .
            </p>
          </div>
          <div className="lg:col-span-7">
            <DemoRequestForm />
          </div>
        </div>
      </SitePageShell>
      <SiteFooter />
    </main>
  )
}
