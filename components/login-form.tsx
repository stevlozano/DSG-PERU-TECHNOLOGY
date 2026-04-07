"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { saveSession } from "@/lib/dashboard/session"
import { mockCompany } from "@/lib/dashboard/mock-data"

export function LoginForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const field =
    "w-full border border-border/50 bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30"

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const raw = String(fd.get("user") ?? "").trim()
    const pass = String(fd.get("password") ?? "")
    if (!raw) {
      setError("Ingresa usuario o correo.")
      return
    }
    if (pass.length < 1) {
      setError("Ingresa tu contraseña.")
      return
    }
    const email = raw.includes("@") ? raw : `${raw}@demo.dsgperu.pe`
    const name = raw.includes("@") ? raw.split("@")[0]! : raw
    const role = raw.toLowerCase().includes("admin") ? "admin" : "operador"
    saveSession({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      company: mockCompany.name,
      role,
      locale: "es-PE",
      lastLogin: new Date().toISOString(),
    })
    const next = redirectTo.startsWith("/") ? redirectTo : "/dashboard"
    router.push(next)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 border border-border/50 bg-card/30 p-8 md:p-10">
      <div>
        <label htmlFor="login-user" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Usuario o correo
        </label>
        <input id="login-user" name="user" type="text" autoComplete="username" className={field} placeholder="usuario@empresa.pe" />
      </div>
      <div>
        <label htmlFor="login-pass" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Contraseña
        </label>
        <input id="login-pass" name="password" type="password" autoComplete="current-password" className={field} placeholder="••••••••" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <input type="checkbox" name="remember" className="border-border text-accent focus:ring-accent" />
          Recordarme
        </label>
        <span className="font-mono text-[10px] text-muted-foreground">
          ¿Olvidaste tu clave?{" "}
          <Link href="/contacto" className="text-accent underline-offset-4 hover:underline">
            Contacto
          </Link>
        </span>
      </div>
      {error ? <p className="font-mono text-xs text-destructive">{error}</p> : null}
      <button
        type="submit"
        className="w-full border border-accent/50 bg-accent/15 py-4 font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent/25"
      >
        Ingresar al panel
      </button>
      <p className="border border-border/40 bg-muted/10 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
        Demo: cualquier usuario y contraseña abren el panel con datos de ejemplo.
      </p>
      <p className="text-center font-mono text-[10px] text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-accent underline-offset-4 hover:underline">
          Registrarse
        </Link>
      </p>
    </form>
  )
}
