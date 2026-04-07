"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export function DemoRequestForm() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const subject = encodeURIComponent(`Solicitud de demo — ${data.get("empresa")}`)
    const body = encodeURIComponent(
      `Empresa: ${data.get("empresa")}\nRubro: ${data.get("rubro")}\nCorreo: ${data.get("email")}\nTeléfono: ${data.get("telefono")}\n\nHorario preferido / notas:\n${data.get("notas")}`,
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
          <label htmlFor="demo-empresa" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Empresa
          </label>
          <input id="demo-empresa" name="empresa" required className={field} placeholder="Razón social" />
        </div>
        <div>
          <label htmlFor="demo-rubro" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Rubro
          </label>
          <input id="demo-rubro" name="rubro" required className={field} placeholder="Farmacia, veterinaria, retail…" />
        </div>
        <div>
          <label htmlFor="demo-email" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Correo corporativo
          </label>
          <input id="demo-email" name="email" type="email" required className={field} placeholder="correo@empresa.pe" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="demo-tel" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Teléfono
          </label>
          <input id="demo-tel" name="telefono" type="tel" className={field} placeholder="+51 …" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="demo-notas" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Horario preferido y detalles
          </label>
          <textarea id="demo-notas" name="notas" rows={4} className={cn(field, "min-h-[120px] resize-y")} placeholder="Ej. mañanas, sucursales, integraciones…" />
        </div>
      </div>
      <button
        type="submit"
        className="border border-accent/50 bg-accent/10 px-8 py-4 font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent/20"
      >
        Solicitar demo
      </button>
      {sent ? (
        <p className="font-mono text-xs text-muted-foreground">Revisa tu aplicación de correo para confirmar el envío.</p>
      ) : null}
    </form>
  )
}
