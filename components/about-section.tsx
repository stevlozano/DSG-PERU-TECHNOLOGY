"use client"

import { useRef, useEffect } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const blockRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !blockRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(blockRef.current, {
        y: 36,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: blockRef.current,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="nosotros"
      className="scroll-mt-14 border-t border-border/30 py-24 pl-6 md:pl-28 pr-6 md:pr-12"
    >
      <div ref={blockRef}>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Nosotros</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-4xl tracking-tight md:text-6xl">QUIÉNES SOMOS</h2>
        <p className="mt-8 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground">
          DSG Peru Technology S.R.L. es una empresa peruana de consultoría en programación y suministro informático.
          Ayudamos a negocios de cualquier RUC a digitalizar ventas, inventarios y facturación con sistemas adaptados a
          farmacias, veterinarias, retail y más.
        </p>
        <Link
          href="/nosotros"
          className="mt-8 inline-block font-mono text-xs uppercase tracking-widest text-accent underline-offset-4 hover:underline"
        >
          Página nosotros →
        </Link>
      </div>
    </section>
  )
}
