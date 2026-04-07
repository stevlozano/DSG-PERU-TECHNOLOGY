"use client"

import { useState } from "react"
import Link from "next/link"

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const data = new FormData(form)
    const pass = String(data.get("password") ?? "")
    const pass2 = String(data.get("password_confirm") ?? "")
    if (pass !== pass2) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (pass.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }
    const subject = encodeURIComponent(`Solicitud de registro — ${data.get("empresa")}`)
    const body = encodeURIComponent(
      `Solicitud de alta en el portal / sistema.\n\nNombre: ${data.get("nombre")}\nEmpresa / RUC: ${data.get("empresa")}\nCorreo: ${data.get("email")}\nTeléfono: ${data.get("telefono")}\n\n(Contraseña no incluida por seguridad; coordinar por canal seguro.)`,
    )
    window.location.href = `mailto:ventas@dsgperutechnology.pe?subject=${subject}&body=${body}`
    setSent(true)
  }

  const field =
    "w-full border border-border/50 bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30"

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 border border-border/50 bg-card/30 p-8 md:p-10">
      <div>
        <label htmlFor="reg-nombre" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Nombre completo
        </label>
        <input id="reg-nombre" name="nombre" required autoComplete="name" className={field} placeholder="Tu nombre" />
      </div>
      <div>
        <label htmlFor="reg-empresa" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Empresa / RUC
        </label>
        <input id="reg-empresa" name="empresa" required className={field} placeholder="Razón social o RUC" />
      </div>
      <div>
        <label htmlFor="reg-email" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Correo
        </label>
        <input id="reg-email" name="email" type="email" required autoComplete="email" className={field} placeholder="correo@empresa.pe" />
      </div>
      <div>
        <label htmlFor="reg-tel" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Teléfono
        </label>
        <input id="reg-tel" name="telefono" type="tel" autoComplete="tel" className={field} placeholder="+51 …" />
      </div>
      <div>
        <label htmlFor="reg-pass" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Contraseña
        </label>
        <input
          id="reg-pass"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className={field}
          placeholder="Mínimo 8 caracteres"
        />
      </div>
      <div>
        <label htmlFor="reg-pass2" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Confirmar contraseña
        </label>
        <input
          id="reg-pass2"
          name="password_confirm"
          type="password"
          required
          autoComplete="new-password"
          className={field}
          placeholder="Repite la contraseña"
        />
      </div>
      <label className="flex cursor-pointer items-start gap-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
        <input type="checkbox" name="terms" required className="mt-0.5 border-border accent-accent" />
        <span>
          Acepto ser contactado/a para completar el registro y he leído la{" "}
          <Link href="/contacto" className="text-accent underline-offset-4 hover:underline">
            información de contacto
          </Link>
          .
        </span>
      </label>
      {error ? <p className="font-mono text-xs text-destructive">{error}</p> : null}
      <button
        type="submit"
        className="w-full border border-accent/50 bg-accent/15 py-4 font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent/25"
      >
        Enviar solicitud de registro
      </button>
      {sent ? (
        <p className="border border-border/40 bg-muted/20 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
          Se abrirá tu correo con la solicitud. El alta definitiva en el portal la confirma nuestro equipo tras validar tu
          empresa.
        </p>
      ) : null}
      <p className="text-center font-mono text-[10px] text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-accent underline-offset-4 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  )
}
