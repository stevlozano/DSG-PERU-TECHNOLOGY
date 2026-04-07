/** Datos de demostración coherentes entre módulos del panel */

export const mockCompany = {
  ruc: "20607209180",
  name: "DSG Peru Technology S.R.L.",
  branch: "Sede principal — Ucayali",
}

export const kpi = {
  salesToday: 4280.5,
  salesTodayDelta: 12.4,
  salesMonth: 89420.0,
  salesMonthDelta: -3.1,
  ticketsToday: 47,
  ticketsDelta: 8,
  lowStockSkus: 6,
  pendingInvoices: 3,
  receivables: 15600.0,
}

export const salesByDay = [
  { day: "Lun", ventas: 6200, tickets: 42 },
  { day: "Mar", ventas: 7100, tickets: 51 },
  { day: "Mié", ventas: 5800, tickets: 38 },
  { day: "Jue", ventas: 9200, tickets: 62 },
  { day: "Vie", ventas: 8800, tickets: 58 },
  { day: "Sáb", ventas: 12400, tickets: 81 },
  { day: "Dom", ventas: 6900, tickets: 44 },
]

export const topProducts = [
  { sku: "FAR-001", name: "Paracetamol 500mg x100", units: 240, revenue: 4800 },
  { sku: "FAR-022", name: "Ibuprofeno 400mg x50", units: 180, revenue: 3960 },
  { sku: "VET-104", name: "Antiparasitario canino", units: 62, revenue: 3100 },
  { sku: "INS-330", name: "Guantes nitrilo M", units: 95, revenue: 1425 },
]

export type SaleRow = {
  id: string
  time: string
  channel: "POS" | "Web" | "Delivery"
  customer: string
  items: number
  total: number
  status: "Pagado" | "Pendiente" | "Anulado"
}

export const recentSales: SaleRow[] = [
  { id: "B01-90421", time: "2026-04-05 11:42", channel: "POS", customer: "Cliente boleta", items: 3, total: 48.5, status: "Pagado" },
  { id: "B01-90420", time: "2026-04-05 11:18", channel: "POS", customer: "Juan Pérez", items: 5, total: 132.0, status: "Pagado" },
  { id: "B01-90419", time: "2026-04-05 10:55", channel: "Delivery", customer: "María López", items: 2, total: 67.0, status: "Pendiente" },
  { id: "B01-90418", time: "2026-04-05 10:12", channel: "Web", customer: "Farmacia Central", items: 12, total: 890.0, status: "Pagado" },
  { id: "B01-90417", time: "2026-04-05 09:30", channel: "POS", customer: "Cliente boleta", items: 1, total: 15.0, status: "Anulado" },
]

export type StockRow = {
  sku: string
  name: string
  category: string
  qty: number
  min: number
  location: string
  lot?: string
  expires?: string
}

export const inventory: StockRow[] = [
  { sku: "FAR-001", name: "Paracetamol 500mg x100", category: "Farmacia", qty: 420, min: 100, location: "A-12", lot: "L2401", expires: "2027-08" },
  { sku: "FAR-022", name: "Ibuprofeno 400mg x50", category: "Farmacia", qty: 88, min: 80, location: "A-12", lot: "L2399", expires: "2026-11" },
  { sku: "FAR-088", name: "Suero fisiológico 500ml", category: "Farmacia", qty: 24, min: 60, location: "B-04" },
  { sku: "VET-104", name: "Antiparasitario canino", category: "Veterinaria", qty: 34, min: 20, location: "V-01" },
  { sku: "VET-201", name: "Vacuna polivalente", category: "Veterinaria", qty: 8, min: 15, location: "V-02" },
  { sku: "INS-330", name: "Guantes nitrilo M", category: "Insumos", qty: 210, min: 50, location: "C-09" },
  { sku: "INS-401", name: "Mascarillas quirúrgicas x50", category: "Insumos", qty: 15, min: 40, location: "C-09" },
]

export function lowStockItems() {
  return inventory.filter((r) => r.qty <= r.min)
}

export type InvoiceRow = {
  id: string
  type: "Factura" | "Boleta" | "Nota"
  sunat: "Aceptado" | "Pendiente" | "Rechazado"
  customer: string
  ruc: string
  date: string
  amount: number
}

export const invoices: InvoiceRow[] = [
  { id: "F001-245", type: "Factura", sunat: "Aceptado", customer: "Distribuidora Andina SAC", ruc: "20501234567", date: "2026-04-04", amount: 4200.0 },
  { id: "B001-892", type: "Boleta", sunat: "Aceptado", customer: "Varios", ruc: "-", date: "2026-04-05", amount: 48.5 },
  { id: "F001-246", type: "Factura", sunat: "Pendiente", customer: "Clínica San José EIRL", ruc: "20609876543", date: "2026-04-05", amount: 3150.0 },
  { id: "B001-891", type: "Boleta", sunat: "Aceptado", customer: "Varios", ruc: "-", date: "2026-04-05", amount: 132.0 },
]

export type CustomerRow = {
  id: string
  name: string
  ruc: string
  segment: "Mayorista" | "Minorista" | "Corporativo"
  lastOrder: string
  balance: number
}

export const customers: CustomerRow[] = [
  { id: "C-1001", name: "Distribuidora Andina SAC", ruc: "20501234567", segment: "Mayorista", lastOrder: "2026-04-04", balance: 0 },
  { id: "C-1002", name: "Clínica San José EIRL", ruc: "20609876543", segment: "Corporativo", lastOrder: "2026-04-01", balance: 3150.0 },
  { id: "C-1003", name: "Veterinaria Patitas", ruc: "10765432109", segment: "Minorista", lastOrder: "2026-03-28", balance: 0 },
  { id: "C-1004", name: "Botica El Progreso", ruc: "20123456789", segment: "Minorista", lastOrder: "2026-04-02", balance: 420.5 },
]

export const activityLog = [
  { id: 1, time: "11:45", user: "Operador 1", action: "Cierre parcial de caja — POS 1", type: "caja" },
  { id: 2, time: "11:20", user: "Admin", action: "Actualización de precio lista mayorista", type: "catálogo" },
  { id: 3, time: "10:58", user: "Operador 2", action: "Ingreso de compra OC-4402", type: "compras" },
  { id: 4, time: "10:12", user: "Sistema", action: "Envío OSE factura F001-245 — OK", type: "sunat" },
  { id: 5, time: "09:05", user: "Operador 1", action: "Apertura de caja — POS 1", type: "caja" },
]

export function formatPEN(n: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n)
}
