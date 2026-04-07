import type { Metadata } from "next"
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client"

export const metadata: Metadata = {
  title: "Panel — DSG Peru Technology",
  description: "Panel de gestión: ventas, inventario, facturación y reportes.",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
