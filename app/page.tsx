import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { SignalsSection } from "@/components/signals-section"
import { WorkSection } from "@/components/work-section"
import { PrinciplesSection } from "@/components/principles-section"
import { DemoSection } from "@/components/demo-section"
import { ColophonSection } from "@/components/colophon-section"
import { SideNav } from "@/components/side-nav"
import { MainNavbar } from "@/components/main-navbar"

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <MainNavbar />
      <SideNav />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 pt-14">
        <HeroSection />
        <AboutSection />
        <SignalsSection />
        <WorkSection />
        <PrinciplesSection />
        <DemoSection />
        <ColophonSection />
      </div>
    </main>
  )
}
