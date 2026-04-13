"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, UserPlus, Pencil, Trash2, DollarSign, GraduationCap, CheckCircle2, Moon, Sun } from "lucide-react"

interface Employee {
  id: string
  name: string
  type: "empleado" | "practicante"
  email: string
  department: string
  salary?: number
  latePenaltyRate: number
  checkInTime: string
  checkOutTime: string
  maxGrade: number
  gradePenaltyRate: number
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
}

const departments = [
  { value: "TI", label: "Tecnologia" },
  { value: "Marketing", label: "Marketing" },
  { value: "Ventas", label: "Ventas" },
  { value: "RRHH", label: "Recursos Humanos" },
  { value: "Finanzas", label: "Finanzas" },
]

export default function AdminAsistenciaPage() {
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

  // Theme classes
  const bgClass = isDarkMode ? "bg-[#0a0a0a] text-white" : "bg-gray-50 text-gray-900"
  const cardBg = isDarkMode ? "bg-[#141414] border-[#2a2a2a]" : "bg-white border-gray-200"
  const inputBg = isDarkMode ? "bg-[#1a1a1a] border-[#2a2a2a]" : "bg-white border-gray-300"
  const headerBorder = isDarkMode ? "border-[#2a2a2a]" : "border-gray-200"
  const mutedText = isDarkMode ? "text-gray-400" : "text-gray-600"
  const tableBorder = isDarkMode ? "border-[#2a2a2a]" : "border-gray-200"

  // Load employees and attendance from localStorage
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  
  useEffect(() => {
    const savedEmployees = localStorage.getItem("dsg-employees")
    const savedAttendance = localStorage.getItem("dsg-attendance")
    
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees))
    } else {
      // Default initial data
      const initialEmployees = [
        { id: "1", name: "Juan Perez", type: "empleado" as const, email: "juan@dsg.pe", department: "TI", salary: 3500, latePenaltyRate: 2, checkInTime: "08:00", checkOutTime: "19:00", maxGrade: 20, gradePenaltyRate: 1 },
        { id: "2", name: "Maria Garcia", type: "practicante" as const, email: "maria@dsg.pe", department: "Marketing", latePenaltyRate: 2, checkInTime: "09:00", checkOutTime: "13:00", maxGrade: 20, gradePenaltyRate: 1 },
      ]
      setEmployees(initialEmployees)
      localStorage.setItem("dsg-employees", JSON.stringify(initialEmployees))
    }
    
    if (savedAttendance) {
      // Convert date strings back to Date objects
      const parsed = JSON.parse(savedAttendance).map((r: any) => ({
        ...r,
        date: new Date(r.date)
      }))
      setAttendance(parsed)
    }
  }, [])
  
  // Save to localStorage whenever data changes
  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem("dsg-employees", JSON.stringify(employees))
    }
  }, [employees])
  
  useEffect(() => {
    localStorage.setItem("dsg-attendance", JSON.stringify(attendance))
  }, [attendance])

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [currentTime, setCurrentTime] = useState(format(new Date(), "HH:mm"))
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(format(new Date(), "HH:mm")), 60000)
    return () => clearInterval(timer)
  }, [])

  const handleCheckIn = () => {
    if (!selectedEmployee) return
    const employee = employees.find(e => e.id === selectedEmployee)
    if (!employee) return
    
    const now = format(new Date(), "HH:mm")
    const isLate = now > employee.checkInTime
    const lateMinutes = isLate ? 10 : 0
    const penaltyAmount = employee.type === "empleado" ? lateMinutes * employee.latePenaltyRate : 0
    const pointsDeducted = employee.type === "practicante" ? lateMinutes * employee.gradePenaltyRate : 0

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      employeeId: selectedEmployee,
      employeeName: employee.name,
      employeeType: employee.type,
      date: new Date(),
      checkIn: now,
      status: isLate ? "tarde" : "presente",
      lateMinutes: isLate ? lateMinutes : undefined,
      penaltyAmount: penaltyAmount || undefined,
      pointsDeducted: pointsDeducted || undefined,
    }
    setAttendance([...attendance, newRecord])
  }

  const onDeleteEmployee = () => {
    if (!deletingEmployee) return
    setEmployees(employees.filter(emp => emp.id !== deletingEmployee.id))
    setAttendance(attendance.filter(record => record.employeeId !== deletingEmployee.id))
    setIsDeleteOpen(false)
    setDeletingEmployee(null)
  }

  const openDeleteDialog = (employee: Employee) => {
    setDeletingEmployee(employee)
    setIsDeleteOpen(true)
  }

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const todayRecords = attendance.filter(r => format(r.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"))

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <header className={`border-b ${headerBorder}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/asistencia">
                <Button variant="ghost" size="icon" className={`h-8 w-8 ${mutedText} hover:text-current`}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Panel Admin - Asistencia</h1>
                <p className={`text-xs ${mutedText}`}>DSG Peru Technology</p>
              </div>
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
              <div className="text-right">
                <p className="text-3xl font-light">{currentTime}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className={`border ${cardBg}`}>
            <CardContent className="p-4">
              <p className={`text-xs ${mutedText} uppercase mb-1`}>Total</p>
              <p className="text-2xl font-light">{employees.length}</p>
            </CardContent>
          </Card>
          <Card className={`border ${cardBg}`}>
            <CardContent className="p-4">
              <p className="text-xs text-emerald-400 uppercase mb-1">Presentes</p>
              <p className="text-2xl font-light text-emerald-400">{todayRecords.filter(r => r.status === "presente").length}</p>
            </CardContent>
          </Card>
          <Card className={`border ${cardBg}`}>
            <CardContent className="p-4">
              <p className="text-xs text-amber-400 uppercase mb-1">Tarde</p>
              <p className="text-2xl font-light text-amber-400">{todayRecords.filter(r => r.status === "tarde").length}</p>
            </CardContent>
          </Card>
          <Card className={`border ${cardBg}`}>
            <CardContent className="p-4">
              <p className="text-xs text-rose-400 uppercase mb-1">Ausentes</p>
              <p className="text-2xl font-light text-rose-400">{employees.length - todayRecords.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Check In Section */}
        <Card className={`border ${cardBg} mb-8`}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <label className={`text-sm ${mutedText} mb-2 block`}>Colaborador</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className={`h-12 ${inputBg}`}>
                    <SelectValue placeholder="Selecciona colaborador" />
                  </SelectTrigger>
                  <SelectContent className={inputBg}>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} - {emp.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleCheckIn} 
                disabled={!selectedEmployee}
                size="lg"
                className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Registrar Asistencia
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card className={`border ${cardBg}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium">Personal DSG</h2>
              <div className="flex gap-3">
                <Input 
                  placeholder="Buscar..." 
                  className={`w-64 ${inputBg}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Nuevo
                </Button>
              </div>
            </div>

            <div className={`border ${tableBorder} rounded-lg overflow-hidden`}>
              <Table>
                <TableHeader>
                  <TableRow className={`${tableBorder} hover:bg-transparent`}>
                    <TableHead className={mutedText}>Nombre</TableHead>
                    <TableHead className={mutedText}>Tipo</TableHead>
                    <TableHead className={mutedText}>Depto</TableHead>
                    <TableHead className={mutedText}>Sueldo/Nota Max</TableHead>
                    <TableHead className={mutedText}>Tarifa Tardanza</TableHead>
                    <TableHead className={mutedText}>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map(emp => (
                    <TableRow key={emp.id} className={tableBorder}>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>
                        <Badge className={emp.type === "empleado" ? "bg-blue-600" : "bg-purple-600"}>
                          {emp.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={mutedText}>{emp.department}</TableCell>
                      <TableCell>
                        {emp.type === "empleado" ? (
                          <span className="text-emerald-400">S/. {emp.salary}</span>
                        ) : (
                          <span className="text-purple-400">{emp.maxGrade} pts</span>
                        )}
                      </TableCell>
                      <TableCell className={mutedText}>
                        {emp.type === "empleado" 
                          ? `S/. ${emp.latePenaltyRate}/min` 
                          : `${emp.gradePenaltyRate} pt/min`}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className={`h-8 w-8 ${mutedText}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-400"
                            onClick={() => openDeleteDialog(emp)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card className={`border ${cardBg} mt-8`}>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Registros de Hoy (General)</h2>
            <div className={`border ${tableBorder} rounded-lg overflow-hidden`}>
              <Table>
                <TableHeader>
                  <TableRow className={`${tableBorder} hover:bg-transparent`}>
                    <TableHead className={mutedText}>Colaborador</TableHead>
                    <TableHead className={mutedText}>Hora</TableHead>
                    <TableHead className={mutedText}>Estado</TableHead>
                    <TableHead className={mutedText}>Penalizacion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayRecords.map(record => (
                    <TableRow key={record.id} className={tableBorder}>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell className={mutedText}>{record.checkIn}</TableCell>
                      <TableCell>
                        <Badge className={record.status === "presente" ? "bg-emerald-600" : "bg-amber-600"}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.penaltyAmount ? (
                          <span className="text-red-400">- S/. {record.penaltyAmount}</span>
                        ) : record.pointsDeducted ? (
                          <span className="text-amber-400">- {record.pointsDeducted} pts</span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {todayRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className={`text-center ${mutedText} py-8`}>
                        No hay registros hoy
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add Employee Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className={`${isDarkMode ? "bg-[#141414] border-[#2a2a2a] text-white" : "bg-white border-gray-200"}`}>
          <DialogHeader>
            <DialogTitle>Nuevo Colaborador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Nombre completo" className={inputBg} />
            <Select>
              <SelectTrigger className={inputBg}>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className={inputBg}>
                <SelectItem value="empleado">Empleado</SelectItem>
                <SelectItem value="practicante">Practicante</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Email" type="email" className={inputBg} />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className={`${isDarkMode ? "bg-[#141414] border-[#2a2a2a] text-white" : "bg-white border-gray-200"}`}>
          <DialogHeader>
            <DialogTitle className="text-red-400">Eliminar Colaborador</DialogTitle>
          </DialogHeader>
          <p className={`${mutedText} py-4`}>
            Esta seguro de eliminar a <strong className={isDarkMode ? "text-white" : "text-gray-900"}>{deletingEmployee?.name}</strong>?
            Esta accion no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={onDeleteEmployee}>Eliminar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
