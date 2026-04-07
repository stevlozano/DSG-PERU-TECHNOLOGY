"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export function ContactForm() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const subject = encodeURIComponent(`Contacto web — ${data.get("nombre")}`)
    const body = encodeURIComponent(
      `Nombre: ${data.get("nombre")}\nEmpresa / RUC: ${data.get("empresa")}\nTeléfono: ${data.get("telefono")}\nCorreo: ${data.get("email")}\n\nMensaje:\n${data.get("mensaje")}`,
    )
    window.location.href = `mailto:ventas@dsgperutechnology.pe?subject=${subject}&body=${body}`
    setSent(true)
  }

  const field =
    "w-full border border-border/50 bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30"

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6 border border-border/40 bg-card/20 p-8 md:p-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="nombre" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Nombre completo
          </label>
          <input id="nombre" name="nombre" required className={field} placeholder="Tu nombre" />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Correo
          </label>
          <input id="email" name="email" type="email" required className={field} placeholder="correo@empresa.pe" />
        </div>
        <div>
          <label htmlFor="telefono" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Teléfono
          </label>
          <input id="telefono" name="telefono" type="tel" className={field} placeholder="+51 …" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="empresa" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Empresa o RUC
          </label>
          <input id="empresa" name="empresa" className={field} placeholder="Razón social o número de RUC" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="mensaje" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Mensaje
          </label>
          <textarea id="mensaje" name="mensaje" required rows={5} className={cn(field, "min-h-[140px] resize-y")} placeholder="Cuéntanos qué necesitas…" />
        </div>
      </div>
      <button
        type="submit"
        className="border border-accent/50 bg-accent/10 px-8 py-4 font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent/20"
      >
        Enviar por correo
      </button>
      {sent ? (
        <p className="font-mono text-xs text-muted-foreground">Se abrirá tu cliente de correo con el mensaje listo para enviar.</p>
      ) : null}
    </form>
  )
}
