import type React from "react"
import type { Metadata } from "next"
import { IBM_Plex_Sans, IBM_Plex_Mono, Bebas_Neue } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SmoothScroll } from "@/components/smooth-scroll"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
})
const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
})
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" })

export const metadata: Metadata = {
  title: "DSG Peru Technology — Sistemas de gestión para empresas en Perú",
  description:
    "Vendemos e implementamos sistemas de gestión para cualquier RUC y giro: farmacias tipo PharmaExpress, veterinarias, comercio y más. Facturación, inventarios y operación alineados a tu negocio en Perú.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/logo/logo_dsg_oficial.jpg",
        type: "image/jpeg",
      },
    ],
    apple: "/logo/logo_dsg_oficial.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${ibmPlexSans.variable} ${bebasNeue.variable} ${ibmPlexMono.variable} font-sans antialiased overflow-x-hidden bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="noise-overlay" aria-hidden="true" />
          <SmoothScroll>{children}</SmoothScroll>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
