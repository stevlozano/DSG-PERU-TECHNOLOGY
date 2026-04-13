"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Moon, Sun, CheckCircle2, ExternalLink, Clock } from "lucide-react"
import { format, parse } from "date-fns"
import { es } from "date-fns/locale"

interface Schedule {
  name: string
  checkInTime: string
  checkOutTime: string
}

interface Employee {
  id: string
  name: string
  type: "empleado" | "practicante"
  email: string
  department: string
  dni?: string
  salary?: number
  latePenaltyRate: number
  checkInTime: string
  checkOutTime: string
  maxGrade: number
  gradePenaltyRate: number
  availableSchedules?: Schedule[]
  flexibleSchedule?: boolean
}

interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  employeeType: "empleado" | "practicante"
  date: Date
  checkIn?: string
  checkOut?: string
  status: "presente" | "ausente" | "tarde"
  lateMinutes?: number
  penaltyAmount?: number
  pointsDeducted?: number
  scheduleUsed?: string
}

export default function AsistenciaLandingPage() {
  const [dni, setDni] = useState("")
  const [currentTime, setCurrentTime] = useState(format(new Date(), "HH:mm"))
  const [lastRegistration, setLastRegistration] = useState<{name: string, time: string, status: string} | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("asistencia-theme")
    if (saved) {
      setIsDarkMode(saved === "dark")
    }
    const timer = setInterval(() => setCurrentTime(format(new Date(), "HH:mm")), 60000)
    return () => clearInterval(timer)
  }, [])

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem("asistencia-theme", newMode ? "dark" : "light")
  }

  const handleCheckIn = () => {
    if (dni.length < 8) return
    
    // Get employees from localStorage
    const savedEmployees = localStorage.getItem("dsg-employees")
    if (!savedEmployees) {
      alert("No hay empleados registrados")
      return
    }
    
    const employees: Employee[] = JSON.parse(savedEmployees)
    const employee = employees.find(emp => emp.dni === dni || emp.id === dni)
    
    if (!employee) {
      alert("DNI no encontrado")
      return
    }
    
    const now = format(new Date(), "HH:mm")
    
    // Determine check-in time based on employee type
    let scheduledTime = employee.checkInTime
    let scheduleName: string | undefined
    
    // For practicantes with available schedules, use first available as default
    if (employee.type === "practicante" && employee.availableSchedules && employee.availableSchedules.length > 0) {
      scheduledTime = employee.availableSchedules[0].checkInTime
      scheduleName = employee.availableSchedules[0].name
    }
    
    const scheduled = parse(scheduledTime, "HH:mm", new Date())
    const actual = parse(now, "HH:mm", new Date())
    const isLate = actual > scheduled
    
    const lateMinutes = isLate 
      ? Math.ceil((actual.getTime() - scheduled.getTime()) / (1000 * 60))
      : 0
    
    const penaltyAmount = employee.type === "empleado" ? lateMinutes * employee.latePenaltyRate : 0
    const pointsDeducted = employee.type === "practicante" ? lateMinutes * employee.gradePenaltyRate : 0

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      employeeId: employee.id,
      employeeName: employee.name,
      employeeType: employee.type,
      date: new Date(),
      checkIn: now,
      status: isLate ? "tarde" : "presente",
      lateMinutes: isLate ? lateMinutes : undefined,
      penaltyAmount: penaltyAmount || undefined,
      pointsDeducted: pointsDeducted || undefined,
      scheduleUsed: scheduleName,
    }
    
    // Save to localStorage
    const savedAttendance = localStorage.getItem("dsg-attendance")
    const allRecords = savedAttendance ? JSON.parse(savedAttendance) : []
    allRecords.push(newRecord)
    localStorage.setItem("dsg-attendance", JSON.stringify(allRecords))
    
    setLastRegistration({
      name: employee.name,
      time: now,
      status: isLate ? "tarde" : "presente"
    })
    
    setDni("")
    alert(`Asistencia registrada: ${employee.name} - ${isLate ? "Tarde" : "Presente"}`)
  }

  const bgClass = isDarkMode ? "bg-[#0a0a0a] text-white" : "bg-gray-50 text-gray-900"
  const cardBg = isDarkMode ? "bg-[#141414] border-[#2a2a2a]" : "bg-white border-gray-200"
  const inputBg = isDarkMode ? "bg-[#1a1a1a] border-[#2a2a2a]" : "bg-white border-gray-300"
  const textColor = isDarkMode ? "text-gray-400" : "text-gray-600"
  const subText = isDarkMode ? "text-gray-500" : "text-gray-500"
  const headerBg = isDarkMode ? "bg-[#141414] border-[#2a2a2a]" : "bg-white border-gray-200"

  return (
    <div className={`min-h-screen ${bgClass} flex flex-col`}>
      {/* Top Bar with Admin Access */}
      <div className={`${headerBg} border-b px-4 py-3`}>
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className={textColor}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Inicio
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={textColor}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link href="/asistencia/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Acceso Admin / Portales
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              BIENVENIDOS A
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-blue-500">
              ASISTENCIA DSG
            </h2>
            <p className={`${subText} mt-2`}>PERU TECHNOLOGY</p>
          </div>

          {/* Time Display */}
          <div className={`text-center mb-6 p-4 ${cardBg} rounded-lg`}>
            <Clock className={`w-6 h-6 ${textColor} mx-auto mb-2`} />
            <p className="text-4xl font-light">{currentTime}</p>
            <p className={`text-sm ${subText}`}>
              {format(new Date(), "EEEE, d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>

          {/* Check-in Form */}
          <Card className={cardBg}>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-center mb-4">
                Registrar Asistencia
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-sm ${textColor} mb-2 block`}>
                    Ingrese su DNI
                  </label>
                  <Input
                    type="text"
                    placeholder="12345678"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    maxLength={8}
                    className={`${inputBg} text-center text-lg tracking-widest h-14`}
                  />
                </div>
                
                <Button 
                  onClick={handleCheckIn}
                  className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                  disabled={dni.length < 8}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Registrar Entrada
                </Button>
              </div>

              {lastRegistration && (
                <div className={`mt-4 p-3 ${isDarkMode ? "bg-green-950/30" : "bg-green-50"} border border-green-600/30 rounded-lg`}>
                  <p className="text-green-400 text-sm text-center">
                    Último registro: <strong>{lastRegistration.name}</strong> a las {lastRegistration.time}
                    <br />
                    <span className={lastRegistration.status === "tarde" ? "text-yellow-400" : "text-green-400"}>
                      Estado: {lastRegistration.status === "tarde" ? "Tarde" : "Presente"}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Link href="/asistencia/empleado">
              <Card className={`${cardBg} hover:border-green-600 transition-all cursor-pointer`}>
                <CardContent className="p-4 text-center">
                  <p className="font-medium text-sm">Portal Empleados</p>
                  <p className={`text-xs ${subText} mt-1`}>Ver sueldo y historial</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/asistencia/practicante">
              <Card className={`${cardBg} hover:border-purple-600 transition-all cursor-pointer`}>
                <CardContent className="p-4 text-center">
                  <p className="font-medium text-sm">Portal Practicantes</p>
                  <p className={`text-xs ${subText} mt-1`}>Ver nota y asistencia</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <p className={`text-center text-xs ${subText} mt-8`}>
            Sistema de Asistencia DSG v2.0
          </p>
        </div>
      </main>
    </div>
  )
}
