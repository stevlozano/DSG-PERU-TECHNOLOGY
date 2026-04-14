"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, parse, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, LogIn, GraduationCap, Clock, CalendarDays, Moon, Sun, AlertTriangle, CheckCircle2, LogOut } from "lucide-react"

interface Schedule {
  name: string
  checkInTime: string
  checkOutTime: string
}

interface AttendanceRecord {
  id: string
  employeeId: string
  date: Date
  checkIn?: string
  checkOut?: string
  status: "presente" | "ausente" | "tarde"
  lateMinutes?: number
  pointsDeducted?: number
  scheduleUsed?: string
}

interface Employee {
  id: string
  name: string
  email: string
  department: string
  maxGrade: number
  gradePenaltyRate: number
  checkInTime: string
  checkOutTime: string
  dni?: string
  type: "empleado" | "practicante"
  availableSchedules?: Schedule[]
  selectedSchedule?: Schedule
  flexibleSchedule?: boolean
}

export default function PracticanteAsistenciaPage() {
  const [dni, setDni] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPracticante, setCurrentPracticante] = useState<Employee | null>(null)
  const [currentTime, setCurrentTime] = useState<string>(format(new Date(), "HH:mm"))
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [myRecords, setMyRecords] = useState<AttendanceRecord[]>([])
  const [totalPointsLost, setTotalPointsLost] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [hasPermission, setHasPermission] = useState(false)

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
    setCurrentPracticante(null)
    setDni("")
    window.location.href = "/asistencia"
  }

  const bgClass = isDarkMode ? "bg-[#0a0a0a] text-white" : "bg-gray-50 text-gray-900"
  const cardBg = isDarkMode ? "bg-[#141414] border-[#2a2a2a]" : "bg-white border-gray-200"
  const inputBg = isDarkMode ? "bg-[#1a1a1a] border-[#2a2a2a]" : "bg-white border-gray-300"
  const headerBorder = isDarkMode ? "border-[#2a2a2a]" : "border-gray-200"
  const mutedText = isDarkMode ? "text-gray-400" : "text-gray-600"
  const tableBorder = isDarkMode ? "border-[#2a2a2a]" : "border-gray-200"
  const subCardBg = isDarkMode ? "bg-[#1a1a1a]" : "bg-gray-100"

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(format(new Date(), "HH:mm"))
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const handleLogin = () => {
    if (dni.length < 8) return
    
    const savedEmployees = localStorage.getItem("dsg-employees")
    const savedAttendance = localStorage.getItem("dsg-attendance")
    
    if (savedEmployees) {
      const employees: Employee[] = JSON.parse(savedEmployees)
      const found = employees.find(emp => (emp.id === dni || emp.dni === dni) && emp.type === "practicante")
      
      if (found) {
        setCurrentPracticante(found)
        setIsAuthenticated(true)
        
        // Set default schedule
        if (found.availableSchedules && found.availableSchedules.length > 0) {
          setSelectedSchedule(found.availableSchedules[0])
        }
        
        if (savedAttendance) {
          const allRecords: AttendanceRecord[] = JSON.parse(savedAttendance).map((r: any) => ({
            ...r,
            date: new Date(r.date)
          }))
          
          const myRecordsFiltered = allRecords.filter(r => r.employeeId === found.id)
          setMyRecords(myRecordsFiltered)
          
          const total = myRecordsFiltered.reduce((sum, r) => sum + (r.pointsDeducted || 0), 0)
          setTotalPointsLost(total)
          
          const today = new Date()
          const todayRec = myRecordsFiltered.find(r => isSameDay(new Date(r.date), today))
          if (todayRec) {
            setTodayRecord(todayRec)
          }
        }
      } else {
        alert("DNI no encontrado o no es un practicante")
      }
    } else {
      alert("No hay practicantes registrados. Contacte al administrador.")
    }
  }

  const handleCheckIn = () => {
    if (!currentPracticante) return
    
    const now = format(new Date(), "HH:mm")
    
    // Determine which schedule to use
    let scheduleToUse = selectedSchedule
    
    // If has flexible schedule and permission, use current time as reference
    if (currentPracticante.flexibleSchedule && hasPermission) {
      // Allow check-in without penalty for being "late" since they have permission
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        employeeId: currentPracticante.id,
        date: new Date(),
        checkIn: now,
        checkOut: undefined,
        status: "presente",
        scheduleUsed: "Horario flexible (con permiso)",
      }
      
      const savedAttendance = localStorage.getItem("dsg-attendance")
      const allRecords = savedAttendance ? JSON.parse(savedAttendance) : []
      allRecords.push(newRecord)
      localStorage.setItem("dsg-attendance", JSON.stringify(allRecords))
      
      setTodayRecord(newRecord)
      setMyRecords([...myRecords, newRecord])
      return
    }
    
    // Normal schedule-based check-in
    if (!scheduleToUse) {
      alert("Seleccione un horario")
      return
    }
    
    const scheduled = parse(scheduleToUse.checkInTime, "HH:mm", new Date())
    const actual = parse(now, "HH:mm", new Date())
    const isLate = actual > scheduled
    
    const lateMinutes = isLate 
      ? Math.ceil((actual.getTime() - scheduled.getTime()) / (1000 * 60))
      : 0
    
    const pointsDeducted = lateMinutes * currentPracticante.gradePenaltyRate

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      employeeId: currentPracticante.id,
      date: new Date(),
      checkIn: now,
      status: isLate ? "tarde" : "presente",
      lateMinutes: isLate ? lateMinutes : undefined,
      pointsDeducted: isLate ? pointsDeducted : undefined,
      scheduleUsed: scheduleToUse.name,
    }
    
    const savedAttendance = localStorage.getItem("dsg-attendance")
    const allRecords = savedAttendance ? JSON.parse(savedAttendance) : []
    allRecords.push(newRecord)
    localStorage.setItem("dsg-attendance", JSON.stringify(allRecords))
    
    setTodayRecord(newRecord)
    setMyRecords([...myRecords, newRecord])
    if (isLate) {
      setTotalPointsLost(prev => prev + pointsDeducted)
    }
  }

  const handleCheckOut = () => {
    if (!currentPracticante || !todayRecord) return
    
    const now = format(new Date(), "HH:mm")
    
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

  const currentGrade = currentPracticante ? Math.max(0, currentPracticante.maxGrade - totalPointsLost) : 0
  const gradePercentage = currentPracticante ? (currentGrade / currentPracticante.maxGrade) * 100 : 0

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4`}>
        <Card className={`w-full max-w-md ${cardBg}`}>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Portal Practicante</h1>
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
                className="w-full bg-purple-600 hover:bg-purple-700"
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
              <h1 className="text-xl font-bold">Hola, {currentPracticante?.name}</h1>
              <p className={`text-sm ${mutedText}`}>Practicante - {currentPracticante?.department}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className={mutedText}>
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
        {/* Grade Card */}
        <Card className={cardBg}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Tu Nota Actual
              </h2>
              <Badge className={gradePercentage >= 70 ? "bg-green-600" : gradePercentage >= 50 ? "bg-yellow-600" : "bg-red-600"}>
                {gradePercentage >= 70 ? "Aprobado" : gradePercentage >= 50 ? "Regular" : "En riesgo"}
              </Badge>
            </div>
            
            <div className="flex items-end gap-2 mb-4">
              <span className={`text-5xl font-bold ${currentGrade < 10 ? 'text-red-400' : 'text-purple-400'}`}>
                {currentGrade.toFixed(1)}
              </span>
              <span className="text-2xl text-gray-400">/ {currentPracticante?.maxGrade}</span>
            </div>
            
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${gradePercentage >= 70 ? 'bg-green-500' : gradePercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${gradePercentage}%` }}
              />
            </div>

            {/* Message about not receiving salary */}
            <div className={`mt-4 p-3 ${subCardBg} rounded-lg`}>
              <p className={`text-sm ${mutedText} text-center`}>
                <GraduationCap className="w-4 h-4 inline mr-1" />
                No recibe propina por su esfuerzo en sus practicas
              </p>
            </div>
            
            {totalPointsLost > 0 && (
              <div className="mt-4 p-3 bg-red-950/30 border border-red-900 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm text-red-400">
                    Has perdido {totalPointsLost} puntos por tardanzas
                  </p>
                  <p className={`text-xs ${mutedText} mt-1`}>
                    Cada minuto de retraso resta {currentPracticante?.gradePenaltyRate} punto
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Registration */}
        <Card className={cardBg}>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Registro de Hoy</h2>
            
            {todayRecord ? (
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 ${subCardBg} rounded-lg`}>
                  <div className="flex items-center gap-3">
                    <Clock className={`w-5 h-5 ${mutedText}`} />
                    <div>
                      <p className="font-medium">Entrada: {todayRecord.checkIn}</p>
                      {todayRecord.checkOut && (
                        <p className={`text-sm ${mutedText}`}>Salida: {todayRecord.checkOut}</p>
                      )}
                      {todayRecord.scheduleUsed && (
                        <p className={`text-xs ${mutedText}`}>Horario: {todayRecord.scheduleUsed}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={todayRecord.status === "presente" ? "bg-green-600" : "bg-yellow-600"}>
                    {todayRecord.status}
                  </Badge>
                </div>
                
                {todayRecord.status === "tarde" && (
                  <div className="p-4 bg-red-950/30 border border-red-900 rounded-lg">
                    <p className="text-red-400 font-medium">
                      <GraduationCap className="w-4 h-4 inline mr-1" />
                      Puntos perdidos: {todayRecord.pointsDeducted}
                    </p>
                    <p className={`text-sm ${mutedText} mt-1`}>
                      {todayRecord.lateMinutes} minutos de retraso
                    </p>
                  </div>
                )}
                
                {!todayRecord.checkOut && (
                  <Button onClick={handleCheckOut} className="w-full bg-purple-600 hover:bg-purple-700">
                    Registrar Salida
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Schedule Selection */}
                {currentPracticante?.availableSchedules && currentPracticante.availableSchedules.length > 0 && (
                  <div>
                    <label className={`text-sm ${mutedText} mb-2 block`}>Seleccione su horario de hoy:</label>
                    <Select 
                      value={selectedSchedule?.name} 
                      onValueChange={(val) => {
                        const schedule = currentPracticante.availableSchedules?.find(s => s.name === val)
                        setSelectedSchedule(schedule || null)
                      }}
                    >
                      <SelectTrigger className={`${inputBg} h-12`}>
                        <SelectValue placeholder="Seleccione horario" />
                      </SelectTrigger>
                      <SelectContent className={inputBg}>
                        {currentPracticante.availableSchedules.map((schedule) => (
                          <SelectItem key={schedule.name} value={schedule.name}>
                            {schedule.name}: {schedule.checkInTime} - {schedule.checkOutTime}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Flexible Schedule Permission */}
                {currentPracticante?.flexibleSchedule && (
                  <div className={`p-4 ${subCardBg} rounded-lg space-y-3`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="permission"
                        checked={hasPermission}
                        onChange={(e) => setHasPermission(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="permission" className="text-sm">
                        <span className="font-medium text-green-400">Tengo permiso del ingeniero</span>
                        <span className={mutedText}> para usar horario flexible</span>
                      </label>
                    </div>
                    {hasPermission && (
                      <p className={`text-xs ${mutedText} ml-7`}>
                        <CheckCircle2 className="w-3 h-3 inline mr-1 text-green-400" />
                        Puede registrar asistencia ahora sin penalización por horario
                      </p>
                    )}
                  </div>
                )}
                
                <Button 
                  onClick={handleCheckIn} 
                  className="w-full h-16 text-lg bg-green-600 hover:bg-green-700"
                  disabled={!selectedSchedule && !hasPermission}
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Registrar Entrada
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My History */}
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
                    <TableHead className={mutedText}>Horario</TableHead>
                    <TableHead className={mutedText}>Entrada</TableHead>
                    <TableHead className={mutedText}>Estado</TableHead>
                    <TableHead className={mutedText}>Puntos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myRecords.map((record) => (
                    <TableRow key={record.id} className={tableBorder}>
                      <TableCell>{format(record.date, "dd/MM/yyyy")}</TableCell>
                      <TableCell className={mutedText}>{record.scheduleUsed || "—"}</TableCell>
                      <TableCell>{record.checkIn || "—"}</TableCell>
                      <TableCell>
                        <Badge className={record.status === "presente" ? "bg-green-600" : "bg-yellow-600"}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={record.pointsDeducted ? "text-red-400" : "text-gray-500"}>
                        {record.pointsDeducted ? `-${record.pointsDeducted}` : "—"}
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
