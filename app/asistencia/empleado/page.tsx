"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format, parse, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, LogIn, DollarSign, Clock, CalendarDays, Moon, Sun, LogOut } from "lucide-react"

interface AttendanceRecord {
  id: string
  employeeId: string
  date: Date
  checkIn?: string
  checkOut?: string
  status: "presente" | "ausente" | "tarde"
  lateMinutes?: number
  penaltyAmount?: number
}

interface Employee {
  id: string
  name: string
  email: string
  department: string
  salary: number
  latePenaltyRate: number
  checkInTime: string
  checkOutTime: string
  dni?: string
}

export default function EmpleadoAsistenciaPage() {
  const [dni, setDni] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
  const [currentTime, setCurrentTime] = useState<string>(format(new Date(), "HH:mm"))
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [myRecords, setMyRecords] = useState<AttendanceRecord[]>([])
  const [totalDiscount, setTotalDiscount] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("asistencia-theme")
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark")
    }
  }, [])

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem("asistencia-theme", newMode ? "dark" : "light")
  }

  const handleLogout = () => {
    sessionStorage.removeItem("dsg-asistencia-auth")
    setIsAuthenticated(false)
    setCurrentEmployee(null)
    setDni("")
    window.location.href = "/asistencia"
  }

  // Theme classes
  const bgClass = isDarkMode ? "bg-[#0a0a0a] text-gray-100" : "bg-gray-50 text-gray-900"
  const cardBg = isDarkMode ? "bg-[#141414] border-[#333333]" : "bg-white border-gray-200"
  const inputBg = isDarkMode ? "bg-[#1a1a1a] border-[#404040] text-gray-100" : "bg-white border-gray-300"
  const headerBorder = isDarkMode ? "border-[#333333]" : "border-gray-200"
  const mutedText = isDarkMode ? "text-gray-400" : "text-gray-600"
  const tableBorder = isDarkMode ? "border-[#333333]" : "border-gray-200"

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(format(new Date(), "HH:mm"))
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Load employee data from localStorage based on DNI
  const handleLogin = () => {
    if (dni.length >= 8) {
      // Get employees from localStorage
      const savedEmployees = localStorage.getItem("dsg-employees")
      const savedAttendance = localStorage.getItem("dsg-attendance")
      
      if (savedEmployees) {
        const employees: Employee[] = JSON.parse(savedEmployees)
        // Find employee by DNI (using id as DNI for demo)
        const found = employees.find(emp => emp.id === dni || emp.dni === dni)
        
        if (found && found.type === "empleado") {
          setCurrentEmployee(found)
          setIsAuthenticated(true)
          
          // Load attendance records for this employee only
          if (savedAttendance) {
            const allRecords: AttendanceRecord[] = JSON.parse(savedAttendance).map((r: any) => ({
              ...r,
              date: new Date(r.date)
            }))
            
            // Filter only this employee's records
            const myRecordsFiltered = allRecords.filter(r => r.employeeId === found.id)
            setMyRecords(myRecordsFiltered)
            
            // Calculate total discount
            const total = myRecordsFiltered.reduce((sum, r) => sum + (r.penaltyAmount || 0), 0)
            setTotalDiscount(total)
            
            // Check if already checked in today
            const today = new Date()
            const todayRec = myRecordsFiltered.find(r => isSameDay(new Date(r.date), today))
            if (todayRec) {
              setTodayRecord(todayRec)
            }
          }
        } else {
          alert("DNI no encontrado o no es un empleado")
        }
      } else {
        alert("No hay empleados registrados. Contacte al administrador.")
      }
    }
  }

  const handleCheckIn = () => {
    if (!currentEmployee) return
    
    const now = format(new Date(), "HH:mm")
    const scheduled = parse(currentEmployee.checkInTime, "HH:mm", new Date())
    const actual = parse(now, "HH:mm", new Date())
    const isLate = actual > scheduled
    
    const lateMinutes = isLate 
      ? Math.ceil((actual.getTime() - scheduled.getTime()) / (1000 * 60))
      : 0
    
    const penaltyAmount = lateMinutes * currentEmployee.latePenaltyRate

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      employeeId: currentEmployee.id,
      date: new Date(),
      checkIn: now,
      status: isLate ? "tarde" : "presente",
      lateMinutes: isLate ? lateMinutes : undefined,
      penaltyAmount: isLate ? penaltyAmount : undefined,
    }
    
    // Save to localStorage
    const savedAttendance = localStorage.getItem("dsg-attendance")
    const allRecords = savedAttendance ? JSON.parse(savedAttendance) : []
    allRecords.push(newRecord)
    localStorage.setItem("dsg-attendance", JSON.stringify(allRecords))
    
    setTodayRecord(newRecord)
    setMyRecords([...myRecords, newRecord])
    if (isLate) {
      setTotalDiscount(prev => prev + penaltyAmount)
    }
  }

  const handleCheckOut = () => {
    if (!currentEmployee || !todayRecord) return
    
    const now = format(new Date(), "HH:mm")
    
    // Update in localStorage
    const savedAttendance = localStorage.getItem("dsg-attendance")
    if (savedAttendance) {
      const allRecords: AttendanceRecord[] = JSON.parse(savedAttendance)
      const updated = allRecords.map(r => 
        r.id === todayRecord.id ? { ...r, checkOut: now } : r
      )
      localStorage.setItem("dsg-attendance", JSON.stringify(updated))
    }
    
    setTodayRecord({
      ...todayRecord,
      checkOut: now,
    })
  }

  const remainingSalary = currentEmployee ? currentEmployee.salary - totalDiscount : 0

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4`}>
        <Card className={`w-full max-w-md ${cardBg}`}>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Portal Empleado</h1>
              <p className={mutedText}>DSG Peru Technology</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`text-sm ${mutedText} mb-2 block`}>Ingrese su DNI</label>
                <Input
                  type="text"
                  placeholder="12345678"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  maxLength={8}
                  className={`${inputBg} text-center text-lg tracking-widest`}
                />
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={dni.length < 8}
              >
                Ingresar
              </Button>
              
              <Link href="/asistencia">
                <Button variant="ghost" className={`w-full ${mutedText}`}>
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
    <div className={`min-h-screen ${bgClass}`}>
      <header className={`border-b ${headerBorder}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Hola, {currentEmployee?.name}</h1>
              <p className={`text-sm ${mutedText}`}>{currentEmployee?.department}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={mutedText}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className={`${mutedText} gap-2`}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Large Clock Section */}
      <div className={`border-b ${headerBorder} py-6 md:py-8`}>
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-5xl md:text-7xl font-extralight tracking-tight">{currentTime}</p>
          <p className={`text-sm md:text-base ${mutedText} mt-1`}>
            {format(new Date(), "EEEE, d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Resumen Salarial */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`${cardBg}`}>
            <CardContent className="p-4">
              <p className={`text-sm ${mutedText} mb-1`}>Sueldo Base</p>
              <p className="text-2xl font-bold text-green-400">
                S/. {currentEmployee?.salary.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className={`${cardBg}`}>
            <CardContent className="p-4">
              <p className={`text-sm ${mutedText} mb-1`}>Descuentos</p>
              <p className="text-2xl font-bold text-red-400">
                - S/. {totalDiscount.toFixed(2)}
              </p>
              <p className={`text-xs ${mutedText}`}>
                S/. {currentEmployee?.latePenaltyRate}/min tarde
              </p>
            </CardContent>
          </Card>
          
          <Card className={`${cardBg}`}>
            <CardContent className="p-4">
              <p className={`text-sm ${mutedText} mb-1`}>Sueldo Neto</p>
              <p className={`text-2xl font-bold ${remainingSalary < (currentEmployee?.salary || 0) * 0.8 ? 'text-yellow-400' : 'text-green-400'}`}>
                S/. {remainingSalary.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registro de Hoy */}
        <Card className={cardBg}>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Registro de Hoy</h2>
            
            {todayRecord ? (
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 ${isDarkMode ? "bg-[#1a1a1a]" : "bg-gray-100"} rounded-lg`}>
                  <div className="flex items-center gap-3">
                    <Clock className={`w-5 h-5 ${mutedText}`} />
                    <div>
                      <p className="font-medium">Entrada: {todayRecord.checkIn}</p>
                      {todayRecord.checkOut && (
                        <p className={`text-sm ${mutedText}`}>Salida: {todayRecord.checkOut}</p>
                      )}
                    </div>
                  </div>
                  <Badge 
                    className={todayRecord.status === "presente" ? "bg-green-600" : "bg-yellow-600"}
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
                    <p className={`text-sm ${mutedText} mt-1`}>
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

        {/* Mi Historial */}
        <Card className={cardBg}>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Mi Historial
            </h2>
            
            <div className={`border ${tableBorder} rounded-lg overflow-hidden`}>
              <Table>
                <TableHeader>
                  <TableRow className={`${tableBorder} hover:bg-transparent`}>
                    <TableHead className={mutedText}>Fecha</TableHead>
                    <TableHead className={mutedText}>Entrada</TableHead>
                    <TableHead className={mutedText}>Salida</TableHead>
                    <TableHead className={mutedText}>Estado</TableHead>
                    <TableHead className={mutedText}>Descuento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myRecords.map((record) => (
                    <TableRow key={record.id} className={tableBorder}>
                      <TableCell>{format(record.date, "dd/MM/yyyy")}</TableCell>
                      <TableCell>{record.checkIn || "—"}</TableCell>
                      <TableCell>{record.checkOut || "—"}</TableCell>
                      <TableCell>
                        <Badge 
                          className={record.status === "presente" ? "bg-green-600" : "bg-yellow-600"}
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={record.penaltyAmount ? "text-red-400" : "text-gray-500"}>
                        {record.penaltyAmount ? `- S/. ${record.penaltyAmount.toFixed(2)}` : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {myRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className={`text-center ${mutedText} py-8`}>
                        No hay registros
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Link href="/asistencia">
          <Button variant="ghost" className={`w-full ${mutedText}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cerrar Sesion
          </Button>
        </Link>
      </main>
    </div>
  )
}
