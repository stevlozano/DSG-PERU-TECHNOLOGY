"use client"

import { useRef, useEffect } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function DemoSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !innerRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(innerRef.current, {
        y: 28,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: {
          trigger: innerRef.current,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="demo"
      className="scroll-mt-14 border-t border-border/30 py-20 pl-6 md:pl-28 pr-6 md:pr-12"
    >
      <div
        ref={innerRef}
        className="flex flex-col gap-8 border border-border/50 bg-card/30 p-8 md:flex-row md:items-center md:justify-between md:p-10"
      >
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Demo</span>
          <h2 className="mt-3 font-[var(--font-bebas)] text-3xl tracking-tight md:text-5xl">PRUEBA EL SISTEMA</h2>
          <p className="mt-4 max-w-xl font-mono text-sm text-muted-foreground">
            Agenda una demostración guiada según tu rubro. Te mostramos flujos reales de venta, stock y reportes.
          </p>
        </div>
        <Link
          href="/demo"
          className="inline-flex w-fit items-center justify-center border border-accent bg-accent/15 px-8 py-4 font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent/25"
        >
          Solicitar demo
        </Link>
      </div>
    </section>
  )
}
