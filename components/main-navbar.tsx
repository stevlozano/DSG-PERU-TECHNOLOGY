"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/tienda", label: "Tienda" },
  { href: "/contacto", label: "Contacto" },
  { href: "/demo", label: "Demo" },
  { href: "/dashboard", label: "Panel" },
] as const

function linkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  if (href === "/dashboard") return pathname === "/dashboard" || pathname.startsWith("/dashboard/")
  return pathname === href
}

export function MainNavbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[55] border-b border-border/40 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 md:px-8 md:pl-24 lg:pl-28">
          <Link
            href="/"
            onClick={close}
            className="group shrink-0 font-[var(--font-bebas)] text-xl tracking-wide text-foreground transition-colors hover:text-accent md:text-2xl"
          >
            <span className="text-accent">DSG</span>
            <span className="text-muted-foreground group-hover:text-foreground"> Peru Technology</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors",
                  linkActive(pathname, href) ? "text-accent" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            ))}
            <ThemeToggle className="ml-2 border-border/50" />
            <Link
              href="/registro"
              className={cn(
                "ml-2 border px-3 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors",
                pathname === "/registro"
                  ? "border-foreground/40 bg-foreground/5 text-foreground"
                  : "border-border/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              Registrarse
            </Link>
            <Link
              href="/login"
              className={cn(
                "ml-1 border px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors",
                pathname === "/login"
                  ? "border-accent bg-accent/20 text-accent"
                  : "border-accent/50 bg-accent/10 text-accent hover:border-accent hover:bg-accent/20",
              )}
            >
              Iniciar sesión
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle className="border-border/50" />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center border border-border/50 text-foreground"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
            >
              {open ? <X className="h-4 w-4" strokeWidth={1.5} /> : <Menu className="h-4 w-4" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-x-0 top-14 z-[54] border-b border-border/40 bg-background/95 backdrop-blur-md md:hidden",
          "transition-all duration-200",
          open ? "pointer-events-auto max-h-[min(75vh,520px)] opacity-100" : "pointer-events-none max-h-0 overflow-hidden opacity-0 border-transparent",
        )}
      >
        <nav className="flex flex-col gap-1 p-4" aria-label="Principal móvil">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className={cn(
                "border border-transparent px-3 py-3 font-mono text-xs uppercase tracking-widest transition-colors",
                linkActive(pathname, href) ? "border-accent/40 text-accent" : "text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/registro"
            onClick={close}
            className={cn(
              "mt-2 border px-3 py-3 text-center font-mono text-xs uppercase tracking-widest",
              pathname === "/registro"
                ? "border-foreground/40 bg-foreground/5 text-foreground"
                : "border-border/60 text-muted-foreground",
            )}
          >
            Registrarse
          </Link>
          <Link
            href="/login"
            onClick={close}
            className={cn(
              "border px-3 py-3 text-center font-mono text-xs uppercase tracking-widest",
              pathname === "/login" ? "border-accent bg-accent/20 text-accent" : "border-accent/50 bg-accent/10 text-accent",
            )}
          >
            Iniciar sesión
          </Link>
        </nav>
      </div>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 top-14 z-[53] bg-background/40 md:hidden"
          aria-hidden
          onClick={close}
        />
      ) : null}
    </>
  )
}
