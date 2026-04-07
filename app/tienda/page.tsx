import type { Metadata } from "next"
import Link from "next/link"
import { MainNavbar } from "@/components/main-navbar"
import { SitePageShell } from "@/components/site-page-shell"
import { SiteFooter } from "@/components/site-footer"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Tienda — Soluciones y sistemas | DSG Peru Technology",
  description:
    "Líneas de sistemas de gestión: ERP, farmacias, veterinarias, POS, nube y desarrollo a medida en Perú.",
}

const products = [
  {
    title: "Gestión integral",
    tag: "ERP / Operaciones",
    desc: "Ventas, compras, inventario, caja y reportes en un solo ecosistema multiusuario.",
  },
  {
    title: "Farmacias",
    tag: "Retail regulado",
    desc: "Stock por lote y caducidad, precios y campañas para boticas y cadenas.",
  },
  {
    title: "Veterinarias",
    tag: "Clínica y tienda",
    desc: "Atención, historial y venta de productos; una o varias sedes.",
  },
  {
    title: "Comercio general",
    tag: "POS y facturación",
    desc: "Cualquier giro con RUC: ferreterías, bodegas, distribuidores.",
  },
  {
    title: "Nube y respaldo",
    tag: "Infraestructura",
    desc: "Despliegue local o en la nube, respaldos y roles por usuario.",
  },
  {
    title: "A medida",
    tag: "Consultoría",
    desc: "Integraciones, reportes específicos y desarrollo según tu operación.",
  },
]

export default function TiendaPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <MainNavbar />
      <SitePageShell>
        <PageHeader
          kicker="Catálogo"
          title="TIENDA"
          description="Elegimos o parametrizamos el sistema según tu rubro, tamaño y obligaciones frente a SUNAT. Cotiza según módulos y sedes."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <article
              key={p.title}
              className="group flex flex-col justify-between border border-border/40 bg-card/10 p-6 transition-colors hover:border-accent/50 md:min-h-[220px] md:p-8"
            >
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{p.tag}</span>
                <h2 className="mt-4 font-[var(--font-bebas)] text-3xl tracking-tight transition-colors group-hover:text-accent md:text-4xl">
                  {p.title}
                </h2>
              </div>
              <p className="mt-6 font-mono text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-border/30 pt-16 md:flex-row md:items-center md:justify-between">
          <p className="max-w-md font-mono text-sm text-muted-foreground">
            ¿Necesitas una demostración o propuesta por escrito? Agenda desde la página de demo o escríbenos.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/demo"
              className="inline-flex border border-accent/50 bg-accent/10 px-6 py-3 font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent/20"
            >
              Solicitar demo
            </Link>
            <Link
              href="/contacto"
              className="inline-flex border border-border/60 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground transition-colors hover:border-accent/40"
            >
              Contacto
            </Link>
          </div>
        </div>
      </SitePageShell>
      <SiteFooter />
    </main>
  )
}
