"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format, startOfMonth, endOfMonth, isWithinInterval, parse } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, LogIn, DollarSign, Clock, CalendarDays } from "lucide-react"

interface AttendanceRecord {
  id: string
  date: Date
  checkIn?: string
  checkOut?: string
  status: "presente" | "ausente" | "tarde"
  lateMinutes?: number
  penaltyAmount?: number
}

// Datos de ejemplo - en producción vendrían de una API
const employeeData = {
  id: "1",
  name: "Juan Perez",
  email: "juan@dsg.pe",
  department: "TI",
  salary: 3500,
  latePenaltyRate: 2,
  checkInTime: "08:00",
  checkOutTime: "19:00",
}

export default function EmpleadoAsistenciaPage() {
  const [dni, setDni] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>(format(new Date(), "HH:mm"))
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [monthlyRecords, setMonthlyRecords] = useState<AttendanceRecord[]>([])
  const [totalDiscount, setTotalDiscount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(format(new Date(), "HH:mm"))
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Simular login con DNI
  const handleLogin = () => {
    if (dni.length >= 8) {
      setIsAuthenticated(true)
      // Cargar datos de ejemplo
      const mockToday: AttendanceRecord = {
        id: "1",
        date: new Date(),
        checkIn: "08:15",
        checkOut: undefined,
        status: "tarde",
        lateMinutes: 15,
        penaltyAmount: 30,
      }
      setTodayRecord(mockToday)
      
      const mockMonth: AttendanceRecord[] = [
        { id: "2", date: new Date(Date.now() - 86400000), checkIn: "08:00", checkOut: "19:00", status: "presente" },
        { id: "3", date: new Date(Date.now() - 172800000), checkIn: "08:30", checkOut: "19:00", status: "tarde", lateMinutes: 30, penaltyAmount: 60 },
      ]
      setMonthlyRecords(mockMonth)
      setTotalDiscount(90)
    }
  }

  const handleCheckIn = () => {
    const now = format(new Date(), "HH:mm")
    const scheduled = parse(employeeData.checkInTime, "HH:mm", new Date())
    const actual = parse(now, "HH:mm", new Date())
    const isLate = actual > scheduled
    
    const lateMinutes = isLate 
      ? Math.ceil((actual.getTime() - scheduled.getTime()) / (1000 * 60))
      : 0
    
    const penaltyAmount = lateMinutes * employeeData.latePenaltyRate

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      date: new Date(),
      checkIn: now,
      status: isLate ? "tarde" : "presente",
      lateMinutes: isLate ? lateMinutes : undefined,
      penaltyAmount: isLate ? penaltyAmount : undefined,
    }
    
    setTodayRecord(newRecord)
    if (isLate) {
      setTotalDiscount(prev => prev + penaltyAmount)
    }
  }

  const handleCheckOut = () => {
    if (todayRecord) {
      setTodayRecord({
        ...todayRecord,
        checkOut: format(new Date(), "HH:mm"),
      })
    }
  }

  const remainingSalary = employeeData.salary - totalDiscount

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#141414] border-[#2a2a2a]">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Portal Empleado</h1>
              <p className="text-gray-400">DSG Peru Technology</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Ingrese su DNI</label>
                <Input
                  type="text"
                  placeholder="12345678"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  maxLength={8}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white text-center text-lg tracking-widest"
                />
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={dni.length < 8}
              >
                Ingresar
              </Button>
              
              <Link href="/asistencia">
                <Button variant="ghost" className="w-full text-gray-400">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-[#2a2a2a]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Hola, {employeeData.name}</h1>
              <p className="text-sm text-gray-400">{employeeData.department}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-light">{currentTime}</p>
              <p className="text-xs text-gray-400">
                {format(new Date(), "EEEE, d MMMM", { locale: es })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Resumen Salarial */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#141414] border-[#2a2a2a]">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400 mb-1">Sueldo Base</p>
              <p className="text-2xl font-bold text-green-400">
                S/. {employeeData.salary.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#141414] border-[#2a2a2a]">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400 mb-1">Descuentos</p>
              <p className="text-2xl font-bold text-red-400">
                - S/. {totalDiscount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                S/. {employeeData.latePenaltyRate}/min tarde
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#141414] border-[#2a2a2a]">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400 mb-1">Sueldo Neto</p>
              <p className={`text-2xl font-bold ${remainingSalary < employeeData.salary * 0.8 ? 'text-yellow-400' : 'text-green-400'}`}>
                S/. {remainingSalary.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registro de Hoy */}
        <Card className="bg-[#141414] border-[#2a2a2a]">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Registro de Hoy</h2>
            
            {todayRecord ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Entrada: {todayRecord.checkIn}</p>
                      {todayRecord.checkOut && (
                        <p className="text-sm text-gray-400">Salida: {todayRecord.checkOut}</p>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant={todayRecord.status === "presente" ? "default" : "secondary"}
                    className={todayRecord.status === "tarde" ? "bg-yellow-600" : "bg-green-600"}
                  >
                    {todayRecord.status}
                  </Badge>
                </div>
                
                {todayRecord.status === "tarde" && (
                  <div className="p-4 bg-red-950/30 border border-red-900 rounded-lg">
                    <p className="text-red-400 font-medium">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Descuento por tardanza: S/. {todayRecord.penaltyAmount?.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {todayRecord.lateMinutes} minutos de retraso
                    </p>
                  </div>
                )}
                
                {!todayRecord.checkOut && (
                  <Button onClick={handleCheckOut} className="w-full bg-blue-600 hover:bg-blue-700">
                    Registrar Salida
                  </Button>
                )}
              </div>
            ) : (
              <Button onClick={handleCheckIn} className="w-full h-16 text-lg bg-green-600 hover:bg-green-700">
                <LogIn className="w-5 h-5 mr-2" />
                Registrar Entrada
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Historial del Mes */}
        <Card className="bg-[#141414] border-[#2a2a2a]">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Historial del Mes
            </h2>
            
            <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                    <TableHead className="text-gray-400">Fecha</TableHead>
                    <TableHead className="text-gray-400">Entrada</TableHead>
                    <TableHead className="text-gray-400">Salida</TableHead>
                    <TableHead className="text-gray-400">Estado</TableHead>
                    <TableHead className="text-gray-400">Descuento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyRecords.map((record) => (
                    <TableRow key={record.id} className="border-[#2a2a2a]">
                      <TableCell>{format(record.date, "dd/MM/yyyy")}</TableCell>
                      <TableCell>{record.checkIn || "—"}</TableCell>
                      <TableCell>{record.checkOut || "—"}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={record.status === "presente" ? "default" : "secondary"}
                          className={record.status === "tarde" ? "bg-yellow-600" : record.status === "ausente" ? "bg-red-600" : "bg-green-600"}
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={record.penaltyAmount ? "text-red-400" : "text-gray-500"}>
                        {record.penaltyAmount ? `- S/. ${record.penaltyAmount.toFixed(2)}` : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {monthlyRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No hay registros este mes
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Link href="/asistencia">
          <Button variant="ghost" className="w-full text-gray-400">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cerrar Sesion
          </Button>
        </Link>
      </main>
    </div>
  )
}
