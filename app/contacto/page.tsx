import type { Metadata } from "next"
import Link from "next/link"
import { MainNavbar } from "@/components/main-navbar"
import { SitePageShell } from "@/components/site-page-shell"
import { SiteFooter } from "@/components/site-footer"
import { PageHeader } from "@/components/page-header"
import { ContactForm } from "@/components/contact-form"

export const metadata: Metadata = {
  title: "Contacto — DSG Peru Technology",
  description: "Escríbenos para cotizaciones, soporte y consultas. DSG Peru Technology S.R.L., Perú.",
}

export default function ContactoPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <MainNavbar />
      <SitePageShell>
        <PageHeader
          kicker="Escríbenos"
          title="CONTACTO"
          description="Cotizaciones, implementación, soporte o dudas sobre nuestros sistemas. Responde el formulario y abriremos tu correo con el mensaje listo para enviar."
        />

        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <ContactForm />

          <aside className="space-y-10 lg:pt-2">
            <div>
              <h2 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Correo</h2>
              <a
                href="mailto:ventas@dsgperutechnology.pe"
                className="mt-3 block font-mono text-sm text-accent transition-colors hover:underline"
              >
                ventas@dsgperutechnology.pe
              </a>
            </div>
            <div>
              <h2 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Empresa</h2>
              <ul className="mt-3 space-y-2 font-mono text-sm text-foreground/85">
                <li>DSG Peru Technology S.R.L.</li>
                <li>RUC 20607209180</li>
                <li>Yarinacocha, Coronel Portillo — Ucayali, Perú</li>
              </ul>
            </div>
            <div>
              <h2 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Actividad</h2>
              <p className="mt-3 font-mono text-sm leading-relaxed text-muted-foreground">
                Consultoría de programación y suministro informático (CIIU 72202).
              </p>
            </div>
            <Link href="/demo" className="inline-block font-mono text-xs uppercase tracking-widest text-accent underline-offset-4 hover:underline">
              Preferir solicitud de demo →
            </Link>
          </aside>
        </div>
      </SitePageShell>
      <SiteFooter />
    </main>
  )
}
