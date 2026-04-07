import type { Metadata } from "next"
import Link from "next/link"
import { MainNavbar } from "@/components/main-navbar"
import { SitePageShell } from "@/components/site-page-shell"
import { SiteFooter } from "@/components/site-footer"
import { RegisterForm } from "@/components/register-form"

export const metadata: Metadata = {
  title: "Registrarse — DSG Peru Technology",
  description: "Solicita el registro en el portal de clientes o acceso a sistemas DSG Peru Technology.",
}

export default function RegistroPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <MainNavbar />
      <SitePageShell className="flex flex-col items-center justify-center pb-24">
        <div className="w-full max-w-lg">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Alta</span>
          <h1 className="mt-4 font-[var(--font-bebas)] text-5xl tracking-tight md:text-7xl">REGISTRARSE</h1>
          <p className="mt-6 max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
            Completa el formulario para solicitar acceso. Validamos tu empresa y te enviamos las credenciales por los canales
            acordados. La contraseña no se envía por correo en el mensaje automático.
          </p>
          <div className="mt-12 flex justify-center">
            <RegisterForm />
          </div>
          <p className="mt-10 text-center font-mono text-xs text-muted-foreground">
            <Link href="/" className="underline-offset-4 hover:text-foreground hover:underline">
              Volver al inicio
            </Link>
          </p>
        </div>
      </SitePageShell>
      <SiteFooter />
    </main>
  )
}
