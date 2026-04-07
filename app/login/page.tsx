import type { Metadata } from "next"
import Link from "next/link"
import { MainNavbar } from "@/components/main-navbar"
import { SitePageShell } from "@/components/site-page-shell"
import { SiteFooter } from "@/components/site-footer"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Iniciar sesión — DSG Peru Technology",
  description: "Acceso al portal de clientes DSG Peru Technology.",
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams
  const nextParam = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/dashboard"

  return (
    <main className="relative min-h-screen bg-background">
      <MainNavbar />
      <SitePageShell className="flex flex-col items-center justify-center pb-24">
        <div className="w-full max-w-lg">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Portal</span>
          <h1 className="mt-4 font-[var(--font-bebas)] text-5xl tracking-tight md:text-7xl">INICIAR SESIÓN</h1>
          <p className="mt-6 max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
            Acceso al panel de gestión. Tras validar credenciales verás ventas, inventario y facturación (demo con datos de
            ejemplo).
          </p>
          <div className="mt-12 flex justify-center">
            <LoginForm redirectTo={nextParam} />
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
