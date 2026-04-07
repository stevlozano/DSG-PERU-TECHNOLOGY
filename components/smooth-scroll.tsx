"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/**
 * Lenis solo en páginas públicas. En /dashboard el scroll es nativo en paneles internos;
 * si Lenis está activo, suele capturar la rueda y el main con overflow ya no desplaza.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const skipLenis = pathname?.startsWith("/dashboard") ?? false

  useEffect(() => {
    if (skipLenis) {
      return
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    })

    lenis.on("scroll", ScrollTrigger.update)

    const tickerCb = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tickerCb)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tickerCb)
      lenis.destroy()
    }
  }, [skipLenis])

  return <>{children}</>
}
