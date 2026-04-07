"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function ColophonSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          x: -60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }

      // Grid columns fade up with stagger
      if (gridRef.current) {
        const columns = gridRef.current.querySelectorAll(":scope > div")
        gsap.from(columns, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }

      // Footer fade in
      if (footerRef.current) {
        gsap.from(footerRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="contacto"
      className="relative scroll-mt-14 border-t border-border/30 py-32 pl-6 md:pl-28 pr-6 md:pr-12"
    >
      {/* Section header */}
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">04 / Empresa</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">CONTACTO</h2>
      </div>

      {/* Multi-column layout */}
      <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-12">
        {/* Razón social */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Razón social</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">DSG Peru Technology S.R.L.</li>
            <li className="font-mono text-xs text-foreground/80">RUC 20607209180</li>
          </ul>
        </div>

        {/* Rubro */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Actividad</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">Consultoría de programación</li>
            <li className="font-mono text-xs text-foreground/80">Suministro informático</li>
          </ul>
        </div>

        {/* Tipografía del sitio */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Tipografía web</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">Bebas Neue</li>
            <li className="font-mono text-xs text-foreground/80">IBM Plex Sans</li>
            <li className="font-mono text-xs text-foreground/80">IBM Plex Mono</li>
          </ul>
        </div>

        {/* Ubicación */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Ubicación</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">Yarinacocha, Coronel Portillo</li>
            <li className="font-mono text-xs text-foreground/80">Ucayali, Perú</li>
          </ul>
        </div>

        {/* Contacto */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Escríbenos</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="mailto:ventas@dsgperutechnology.pe"
                className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors duration-200"
              >
                ventas@dsgperutechnology.pe
              </a>
            </li>
            <li className="font-mono text-xs text-muted-foreground leading-relaxed">
              También por WhatsApp: escríbenos al correo y te respondemos con el número comercial.
            </li>
          </ul>
        </div>

        {/* Año */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Desde</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">Activa desde 2021</li>
            <li className="font-mono text-xs text-foreground/80">2026</li>
          </ul>
        </div>
      </div>

      {/* Bottom copyright */}
      <div
        ref={footerRef}
        className="mt-24 pt-8 border-t border-border/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          © 2026 DSG Peru Technology S.R.L. Todos los derechos reservados.
        </p>
        <p className="font-mono text-[10px] text-muted-foreground">
          Sistemas de gestión para farmacias, veterinarias, comercio y cualquier RUC en Perú.
        </p>
      </div>
    </section>
  )
}
