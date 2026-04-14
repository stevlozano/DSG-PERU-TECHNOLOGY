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
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, UserPlus, Pencil, Trash2, DollarSign, GraduationCap, Clock, Moon, Sun, Users, Calendar, Save, LogOut, ChevronLeft, ChevronRight } from "lucide-react"

interface Schedule {
  name: string
  checkInTime: string
  checkOutTime: string
}

interface Employee {
  id: string
  dni: string
  name: string
  type: "empleado" | "practicante"
  email: string
  department: string
  salary?: number
  latePenaltyRate: number
  checkInTime: string
  checkOutTime: string
  breakStartTime: string
  breakEndTime: string
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

const departments = [
  { value: "TI", label: "Tecnologia" },
  { value: "Marketing", label: "Marketing" },
  { value: "Ventas", label: "Ventas" },
  { value: "RRHH", label: "Recursos Humanos" },
  { value: "Finanzas", label: "Finanzas" },
  { value: "Operaciones", label: "Operaciones" },
]

const defaultSchedules: Schedule[] = [
  { name: "Mañana", checkInTime: "09:00", checkOutTime: "13:00" },
  { name: "Tarde", checkInTime: "14:00", checkOutTime: "18:00" },
  { name: "Mañana (Extendido)", checkInTime: "08:00", checkOutTime: "14:00" },
  { name: "Tarde (Extendido)", checkInTime: "14:00", checkOutTime: "20:00" },
]

export default function AdminAsistenciaPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  
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
    window.location.href = "/asistencia"
  }

  const bgClass = isDarkMode ? "bg-[#0a0a0a] text-gray-100" : "bg-gray-50 text-gray-900"
  const cardBg = isDarkMode ? "bg-[#141414] border-[#333333]" : "bg-white border-gray-200"
  const inputBg = isDarkMode ? "bg-[#1a1a1a] border-[#404040] text-gray-100" : "bg-white border-gray-300"
  const headerBorder = isDarkMode ? "border-[#333333]" : "border-gray-200"
  const mutedText = isDarkMode ? "text-gray-400" : "text-gray-600"
  const tableBorder = isDarkMode ? "border-[#333333]" : "border-gray-200"
  const subCardBg = isDarkMode ? "bg-[#1a1a1a]" : "bg-gray-100"

  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  
  useEffect(() => {
    const savedEmployees = localStorage.getItem("dsg-employees")
    const savedAttendance = localStorage.getItem("dsg-attendance")
    
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees))
    }
    
    if (savedAttendance) {
      const parsed = JSON.parse(savedAttendance).map((r: any) => ({
        ...r,
        date: new Date(r.date)
      }))
      setAttendance(parsed)
    }
  }, [])
  
  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem("dsg-employees", JSON.stringify(employees))
    }
  }, [employees])
  
  useEffect(() => {
    localStorage.setItem("dsg-attendance", JSON.stringify(attendance))
  }, [attendance])

  // Add/Edit employee states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    type: "empleado",
    department: "TI",
    salary: 0,
    latePenaltyRate: 2,
    checkInTime: "08:00",
    checkOutTime: "19:00",
    breakStartTime: "13:00",
    breakEndTime: "15:00",
    maxGrade: 20,
    gradePenaltyRate: 1,
    flexibleSchedule: false,
  })
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>(["Mañana"])

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTime, setCurrentTime] = useState(format(new Date(), "HH:mm"))

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [attendancePage, setAttendancePage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(format(new Date(), "HH:mm")), 60000)
    return () => clearInterval(timer)
  }, [])

  const handleScheduleToggle = (scheduleName: string) => {
    setSelectedSchedules(prev => {
      if (prev.includes(scheduleName)) {
        return prev.filter(s => s !== scheduleName)
      }
      return [...prev, scheduleName]
    })
  }

  const handleAddEmployee = () => {
    if (!newEmployee.dni || !newEmployee.name || !newEmployee.email) {
      alert("Complete todos los campos obligatorios")
      return
    }

    const availableSchedules = newEmployee.type === "practicante" 
      ? selectedSchedules.map(name => defaultSchedules.find(s => s.name === name)!).filter(Boolean)
      : undefined

    const employee: Employee = {
      id: newEmployee.dni,
      dni: newEmployee.dni,
      name: newEmployee.name,
      type: newEmployee.type || "empleado",
      email: newEmployee.email,
      department: newEmployee.department || "TI",
      salary: newEmployee.type === "empleado" ? (newEmployee.salary || 0) : undefined,
      latePenaltyRate: newEmployee.latePenaltyRate || 2,
      checkInTime: newEmployee.checkInTime || "08:00",
      checkOutTime: newEmployee.checkOutTime || "19:00",
      breakStartTime: newEmployee.breakStartTime || "13:00",
      breakEndTime: newEmployee.breakEndTime || "15:00",
      maxGrade: newEmployee.maxGrade || 20,
      gradePenaltyRate: newEmployee.gradePenaltyRate || 1,
      flexibleSchedule: newEmployee.flexibleSchedule,
      availableSchedules,
    }

    setEmployees([...employees, employee])
    setIsAddOpen(false)
    resetForm()
  }

  const handleEditEmployee = () => {
    if (!editingEmployee) return

    const availableSchedules = editingEmployee.type === "practicante" 
      ? selectedSchedules.map(name => defaultSchedules.find(s => s.name === name)!).filter(Boolean)
      : undefined

    const updatedEmployee: Employee = {
      ...editingEmployee,
      availableSchedules,
    }

    setEmployees(employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp))
    setIsEditOpen(false)
    setEditingEmployee(null)
  }

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee)
    if (employee.type === "practicante" && employee.availableSchedules) {
      setSelectedSchedules(employee.availableSchedules.map(s => s.name))
    } else {
      setSelectedSchedules(["Mañana"])
    }
    setIsEditOpen(true)
  }

  const resetForm = () => {
    setNewEmployee({
      type: "empleado",
      department: "TI",
      salary: 0,
      latePenaltyRate: 2,
      checkInTime: "08:00",
      checkOutTime: "19:00",
      breakStartTime: "13:00",
      breakEndTime: "15:00",
      maxGrade: 20,
      gradePenaltyRate: 1,
      flexibleSchedule: false,
    })
    setSelectedSchedules(["Mañana"])
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
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.dni.includes(searchTerm)
  )

  // Pagination for employees
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const todayRecords = attendance.filter(r => format(r.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"))

  // Pagination for attendance
  const totalAttendancePages = Math.ceil(attendance.length / itemsPerPage)
  const paginatedAttendance = attendance.slice().reverse().slice((attendancePage - 1) * itemsPerPage, attendancePage * itemsPerPage)

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <header className={`border-b ${headerBorder}`}>
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/asistencia">
                <Button variant="ghost" size="icon" className={`h-8 w-8 ${mutedText}`}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg md:text-xl font-bold">Panel Administrador</h1>
                <p className={`text-xs ${mutedText} hidden sm:block`}>Gestion de Personal y Asistencia</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
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
              <div className="text-right hidden md:block">
                <p className="text-2xl font-light">{currentTime}</p>
              </div>
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

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className={`border ${cardBg}`}>
            <CardContent className="p-3 md:p-4">
              <p className={`text-xs ${mutedText} uppercase mb-1`}>Total Personal</p>
              <p className="text-xl md:text-2xl font-light flex items-center gap-2">
                <Users className="w-4 h-4 md:w-5 md:h-5" />
                {employees.length}
              </p>
            </CardContent>
          </Card>
          <Card className={`border ${cardBg}`}>
            <CardContent className="p-3 md:p-4">
              <p className={`text-xs ${mutedText} uppercase mb-1`}>Empleados</p>
              <p className="text-xl md:text-2xl font-light text-blue-400">
                {employees.filter(e => e.type === "empleado").length}
              </p>
            </CardContent>
          </Card>
          <Card className={`border ${cardBg}`}>
            <CardContent className="p-3 md:p-4">
              <p className={`text-xs ${mutedText} uppercase mb-1`}>Practicantes</p>
              <p className="text-xl md:text-2xl font-light text-purple-400">
                {employees.filter(e => e.type === "practicante").length}
              </p>
            </CardContent>
          </Card>
          <Card className={`border ${cardBg}`}>
            <CardContent className="p-3 md:p-4">
              <p className={`text-xs ${mutedText} uppercase mb-1`}>Registros Hoy</p>
              <p className="text-xl md:text-2xl font-light text-green-400">{todayRecords.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Employees Section */}
        <Card className={`border ${cardBg}`}>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-base md:text-lg font-medium flex items-center gap-2">
                <Users className="w-5 h-5" />
                Personal Registrado
              </h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  placeholder="Buscar..." 
                  className={`w-full sm:w-48 ${inputBg}`}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                />
                <Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Nuevo</span>
                  <span className="sm:hidden">Agregar</span>
                </Button>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {paginatedEmployees.map(emp => (
                <Card key={emp.id} className={`${subCardBg} border ${tableBorder}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className={`text-xs ${mutedText}`}>{emp.dni}</p>
                      </div>
                      <Badge className={emp.type === "empleado" ? "bg-blue-600" : "bg-purple-600"}>
                        {emp.type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={mutedText}>{emp.department}</span>
                      {emp.type === "empleado" ? (
                        <span className="text-green-400">S/. {emp.salary}</span>
                      ) : (
                        <span className="text-purple-400">{emp.maxGrade} pts</span>
                      )}
                    </div>
                    <div className={`text-xs ${mutedText}`}>
                      {emp.type === "practicante" && emp.availableSchedules ? (
                        emp.availableSchedules.map(s => s.name).join(", ")
                      ) : (
                        `${emp.checkInTime} - ${emp.checkOutTime}`
                      )}
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-700/30">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openEditDialog(emp)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => openDeleteDialog(emp)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {paginatedEmployees.length === 0 && (
                <p className={`text-center ${mutedText} py-8`}>No hay empleados registrados</p>
              )}
            </div>

            {/* Desktop Table View */}
            <div className={`hidden md:block border ${tableBorder} rounded-lg overflow-hidden`}>
              <Table>
                <TableHeader>
                  <TableRow className={`${tableBorder} hover:bg-transparent`}>
                    <TableHead className={mutedText}>DNI</TableHead>
                    <TableHead className={mutedText}>Nombre</TableHead>
                    <TableHead className={mutedText}>Tipo</TableHead>
                    <TableHead className={mutedText}>Depto</TableHead>
                    <TableHead className={mutedText}>Horario(s)</TableHead>
                    <TableHead className={mutedText}>Sueldo/Nota</TableHead>
                    <TableHead className={mutedText}>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.map(emp => (
                    <TableRow key={emp.id} className={tableBorder}>
                      <TableCell className="font-mono">{emp.dni}</TableCell>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>
                        <Badge className={emp.type === "empleado" ? "bg-blue-600" : "bg-purple-600"}>
                          {emp.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={mutedText}>{emp.department}</TableCell>
                      <TableCell className={`text-xs ${mutedText}`}>
                        {emp.type === "practicante" && emp.availableSchedules ? (
                          <div className="flex flex-col gap-1">
                            {emp.availableSchedules.map((sched, idx) => (
                              <span key={idx} className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {sched.name}: {sched.checkInTime}-{sched.checkOutTime}
                              </span>
                            ))}
                            {emp.flexibleSchedule && (
                              <span className="text-green-400">(Horario flexible)</span>
                            )}
                          </div>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {emp.checkInTime} - {emp.checkOutTime}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {emp.type === "empleado" ? (
                          <span className="text-green-400 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            S/. {emp.salary}
                          </span>
                        ) : (
                          <span className="text-purple-400 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            {emp.maxGrade} pts
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 ${mutedText}`}
                            onClick={() => openEditDialog(emp)}
                          >
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
                  {filteredEmployees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className={`text-center ${mutedText} py-8`}>
                        No hay empleados registrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination for Employees */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className={`text-sm ${mutedText}`}>
                  Pagina {currentPage} de {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance History Section */}
        <Card className={`border ${cardBg}`}>
          <CardContent className="p-4 md:p-6">
            <h2 className="text-base md:text-lg font-medium mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Historial de Asistencia
            </h2>
            
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {paginatedAttendance.map(record => (
                <Card key={record.id} className={`${subCardBg} border ${tableBorder}`}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{record.employeeName}</span>
                      <Badge className={record.status === "presente" ? "bg-green-600" : "bg-yellow-600"}>
                        {record.status}
                      </Badge>
                    </div>
                    <div className={`text-xs ${mutedText}`}>
                      {format(record.date, "dd/MM/yyyy HH:mm")}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Entrada: {record.checkIn}</span>
                      {record.penaltyAmount ? (
                        <span className="text-red-400">- S/. {record.penaltyAmount}</span>
                      ) : record.pointsDeducted ? (
                        <span className="text-amber-400">- {record.pointsDeducted} pts</span>
                      ) : null}
                    </div>
                    {record.scheduleUsed && (
                      <div className={`text-xs ${mutedText}`}>Horario: {record.scheduleUsed}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {paginatedAttendance.length === 0 && (
                <p className={`text-center ${mutedText} py-8`}>No hay registros</p>
              )}
            </div>

            {/* Desktop Table View */}
            <div className={`hidden md:block border ${tableBorder} rounded-lg overflow-hidden`}>
              <Table>
                <TableHeader>
                  <TableRow className={`${tableBorder} hover:bg-transparent`}>
                    <TableHead className={mutedText}>Fecha</TableHead>
                    <TableHead className={mutedText}>Colaborador</TableHead>
                    <TableHead className={mutedText}>Horario</TableHead>
                    <TableHead className={mutedText}>Entrada</TableHead>
                    <TableHead className={mutedText}>Estado</TableHead>
                    <TableHead className={mutedText}>Penalizacion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAttendance.map(record => (
                    <TableRow key={record.id} className={tableBorder}>
                      <TableCell className={mutedText}>
                        {format(record.date, "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell className={mutedText}>{record.scheduleUsed || "—"}</TableCell>
                      <TableCell>{record.checkIn}</TableCell>
                      <TableCell>
                        <Badge className={record.status === "presente" ? "bg-green-600" : "bg-yellow-600"}>
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
                  {attendance.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className={`text-center ${mutedText} py-8`}>
                        No hay registros de asistencia
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination for Attendance */}
            {totalAttendancePages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAttendancePage(p => Math.max(1, p - 1))}
                  disabled={attendancePage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className={`text-sm ${mutedText}`}>
                  Pagina {attendancePage} de {totalAttendancePages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAttendancePage(p => Math.min(totalAttendancePages, p + 1))}
                  disabled={attendancePage === totalAttendancePages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add/Edit/Delete Dialogs remain the same but with responsive adjustments */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className={`${isDarkMode ? "bg-[#141414] border-[#2a2a2a] text-white" : "bg-white border-gray-200"} max-w-2xl max-h-[90vh] w-[95vw] sm:w-auto p-0`}>
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-lg md:text-xl">Registrar Nuevo Colaborador</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className={`p-4 ${subCardBg} rounded-lg space-y-3`}>
              <h4 className="font-medium text-sm">Informacion Basica</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs ${mutedText} mb-1 block`}>DNI *</label>
                  <Input 
                    placeholder="12345678" 
                    value={newEmployee.dni || ""} 
                    onChange={(e) => setNewEmployee({...newEmployee, dni: e.target.value})}
                    className={inputBg}
                    maxLength={8}
                  />
                </div>
                <div>
                  <label className={`text-xs ${mutedText} mb-1 block`}>Nombre Completo *</label>
                  <Input 
                    placeholder="Juan Perez" 
                    value={newEmployee.name || ""} 
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    className={inputBg}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs ${mutedText} mb-1 block`}>Email *</label>
                  <Input 
                    type="email"
                    placeholder="juan@dsg.pe" 
                    value={newEmployee.email || ""} 
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    className={inputBg}
                  />
                </div>
                <div>
                  <label className={`text-xs ${mutedText} mb-1 block`}>Departamento</label>
                  <Select 
                    value={newEmployee.department} 
                    onValueChange={(val) => setNewEmployee({...newEmployee, department: val})}
                  >
                    <SelectTrigger className={inputBg}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={inputBg}>
                      {departments.map(d => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className={`text-xs ${mutedText} mb-1 block`}>Tipo</label>
                <Select 
                  value={newEmployee.type} 
                  onValueChange={(val: "empleado" | "practicante") => setNewEmployee({...newEmployee, type: val})}
                >
                  <SelectTrigger className={inputBg}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={inputBg}>
                    <SelectItem value="empleado">Empleado</SelectItem>
                    <SelectItem value="practicante">Practicante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newEmployee.type === "empleado" ? (
              <div className={`p-4 ${subCardBg} rounded-lg space-y-3`}>
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horario de Trabajo
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs ${mutedText} mb-1 block`}>Hora Entrada</label>
                    <Input 
                      type="time"
                      value={newEmployee.checkInTime} 
                      onChange={(e) => setNewEmployee({...newEmployee, checkInTime: e.target.value})}
                      className={inputBg}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${mutedText} mb-1 block`}>Hora Salida</label>
                    <Input 
                      type="time"
                      value={newEmployee.checkOutTime} 
                      onChange={(e) => setNewEmployee({...newEmployee, checkOutTime: e.target.value})}
                      className={inputBg}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs ${mutedText} mb-1 block`}>Inicio Receso</label>
                    <Input 
                      type="time"
                      value={newEmployee.breakStartTime} 
                      onChange={(e) => setNewEmployee({...newEmployee, breakStartTime: e.target.value})}
                      className={inputBg}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${mutedText} mb-1 block`}>Fin Receso</label>
                    <Input 
                      type="time"
                      value={newEmployee.breakEndTime} 
                      onChange={(e) => setNewEmployee({...newEmployee, breakEndTime: e.target.value})}
                      className={inputBg}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-4 ${subCardBg} rounded-lg space-y-3`}>
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Horarios Disponibles para el Practicante
                </h4>
                <p className={`text-xs ${mutedText}`}>Seleccione los horarios que el practicante puede usar (con permiso del ingeniero):</p>
                
                <div className="space-y-2">
                  {defaultSchedules.map((schedule) => (
                    <div key={schedule.name} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`add-${schedule.name}`}
                        checked={selectedSchedules.includes(schedule.name)}
                        onCheckedChange={() => handleScheduleToggle(schedule.name)}
                      />
                      <label htmlFor={`add-${schedule.name}`} className="text-sm flex-1">
                        <span className="font-medium">{schedule.name}:</span> 
                        <span className={mutedText}> {schedule.checkInTime} - {schedule.checkOutTime}</span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="add-flexible"
                    checked={newEmployee.flexibleSchedule}
                    onCheckedChange={(checked) => setNewEmployee({...newEmployee, flexibleSchedule: checked as boolean})}
                  />
                  <label htmlFor="add-flexible" className="text-sm">
                    <span className="font-medium text-green-400">Permitir horario flexible</span>
                    <span className={mutedText}> (puede registrar asistencia en cualquier hora con permiso)</span>
                  </label>
                </div>
              </div>
            )}

            {newEmployee.type === "empleado" ? (
              <div className={`p-4 ${subCardBg} rounded-lg space-y-3`}>
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Configuracion Salarial
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs ${mutedText} mb-1 block`}>Sueldo Mensual (S/.)</label>
                    <Input 
                      type="number"
                      placeholder="3500" 
                      value={newEmployee.salary || ""} 
                      onChange={(e) => setNewEmployee({...newEmployee, salary: Number(e.target.value)})}
                      className={inputBg}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${mutedText} mb-1 block`}>Descuento por min tarde (S/.)</label>
                    <Input 
                      type="number"
                      step="0.5"
                      placeholder="2" 
                      value={newEmployee.latePenaltyRate} 
                      onChange={(e) => setNewEmployee({...newEmployee, latePenaltyRate: Number(e.target.value)})}
                      className={inputBg}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-4 ${subCardBg} rounded-lg space-y-3`}>
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Configuracion de Nota
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs ${mutedText} mb-1 block`}>Nota Maxima</label>
                    <Input 
                      type="number"
                      placeholder="20" 
                      value={newEmployee.maxGrade} 
                      onChange={(e) => setNewEmployee({...newEmployee, maxGrade: Number(e.target.value)})}
                      className={inputBg}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${mutedText} mb-1 block`}>Puntos por min tarde</label>
                    <Input 
                      type="number"
                      step="0.5"
                      placeholder="1" 
                      value={newEmployee.gradePenaltyRate} 
                      onChange={(e) => setNewEmployee({...newEmployee, gradePenaltyRate: Number(e.target.value)})}
                      className={inputBg}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setIsAddOpen(false); resetForm(); }} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={handleAddEmployee} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className={`${isDarkMode ? "bg-[#141414] border-[#2a2a2a] text-white" : "bg-white border-gray-200"} max-w-2xl max-h-[90vh] w-[95vw] sm:w-auto p-0`}>
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-lg md:text-xl flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Editar Colaborador
            </DialogTitle>
          </DialogHeader>
          
          {editingEmployee && (
            <div className="space-y-4 p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className={`p-4 ${subCardBg} rounded-lg space-y-3`}>
                <h4 className="font-medium text-sm">Informacion Basica</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs ${mutedText} mb-1 block`}>DNI</label>
                    <Input 
                      value={editingEmployee.dni} 
                      disabled
                      className={`${inputBg} opacity-50`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${mutedText} mb-1 block`}>Nombre Completo *</label>
                    <Input 
                      value={editingEmployee.name} 
                      onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                      className={inputBg}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs ${mutedText} mb-1 block`}>Email *</label>
                    <Input 
                      type="email"
                      value={editingEmployee.email} 
                      onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})}
                      className={inputBg}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${mutedText} mb-1 block`}>Departamento</label>
                    <Select 
                      value={editingEmployee.department} 
                      onValueChange={(val) => setEditingEmployee({...editingEmployee, department: val})}
                    >
                      <SelectTrigger className={inputBg}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={inputBg}>
                        {departments.map(d => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {editingEmployee.type === "empleado" ? (
                <>
                  <div className={`p-4 ${subCardBg} rounded-lg space-y-3`}>
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Horario de Trabajo
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`text-xs ${mutedText} mb-1 block`}>Hora Entrada</label>
                        <Input 
                          type="time"
                          value={editingEmployee.checkInTime} 
                          onChange={(e) => setEditingEmployee({...editingEmployee, checkInTime: e.target.value})}
                          className={inputBg}
                        />
                      </div>
                      <div>
                        <label className={`text-xs ${mutedText} mb-1 block`}>Hora Salida</label>
                        <Input 
                          type="time"
                          value={editingEmployee.checkOutTime} 
                          onChange={(e) => setEditingEmployee({...editingEmployee, checkOutTime: e.target.value})}
                          className={inputBg}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 ${subCardBg} rounded-lg space-y-3`}>
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Configuracion Salarial
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`text-xs ${mutedText} mb-1 block`}>Sueldo Mensual (S/.)</label>
                        <Input 
                          type="number"
                          value={editingEmployee.salary || ""} 
                          onChange={(e) => setEditingEmployee({...editingEmployee, salary: Number(e.target.value)})}
                          className={inputBg}
                        />
                      </div>
                      <div>
                        <label className={`text-xs ${mutedText} mb-1 block`}>Descuento por min tarde (S/.)</label>
                        <Input 
                          type="number"
                          step="0.5"
                          value={editingEmployee.latePenaltyRate} 
                          onChange={(e) => setEditingEmployee({...editingEmployee, latePenaltyRate: Number(e.target.value)})}
                          className={inputBg}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={`p-4 ${subCardBg} rounded-lg space-y-3`}>
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Horarios Disponibles
                    </h4>
                    <p className={`text-xs ${mutedText}`}>Seleccione los horarios disponibles:</p>
                    
                    <div className="space-y-2">
                      {defaultSchedules.map((schedule) => (
                        <div key={schedule.name} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`edit-${schedule.name}`}
                            checked={selectedSchedules.includes(schedule.name)}
                            onCheckedChange={() => handleScheduleToggle(schedule.name)}
                          />
                          <label htmlFor={`edit-${schedule.name}`} className="text-sm flex-1">
                            <span className="font-medium">{schedule.name}:</span> 
                            <span className={mutedText}> {schedule.checkInTime} - {schedule.checkOutTime}</span>
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="edit-flexible"
                        checked={editingEmployee.flexibleSchedule}
                        onCheckedChange={(checked) => setEditingEmployee({...editingEmployee, flexibleSchedule: checked as boolean})}
                      />
                      <label htmlFor="edit-flexible" className="text-sm">
                        <span className="font-medium text-green-400">Permitir horario flexible</span>
                      </label>
                    </div>
                  </div>

                  <div className={`p-4 ${subCardBg} rounded-lg space-y-3`}>
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Configuracion de Nota
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`text-xs ${mutedText} mb-1 block`}>Nota Maxima</label>
                        <Input 
                          type="number"
                          value={editingEmployee.maxGrade} 
                          onChange={(e) => setEditingEmployee({...editingEmployee, maxGrade: Number(e.target.value)})}
                          className={inputBg}
                        />
                      </div>
                      <div>
                        <label className={`text-xs ${mutedText} mb-1 block`}>Puntos por min tarde</label>
                        <Input 
                          type="number"
                          step="0.5"
                          value={editingEmployee.gradePenaltyRate} 
                          onChange={(e) => setEditingEmployee({...editingEmployee, gradePenaltyRate: Number(e.target.value)})}
                          className={inputBg}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditingEmployee(null); }} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button onClick={handleEditEmployee} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className={`${isDarkMode ? "bg-[#141414] border-[#2a2a2a] text-white" : "bg-white border-gray-200"} w-[95vw] sm:w-auto max-w-md`}>
          <DialogHeader>
            <DialogTitle className="text-red-400">Eliminar Colaborador</DialogTitle>
          </DialogHeader>
          <p className={`${mutedText} py-4`}>
            Esta seguro de eliminar a <strong className={isDarkMode ? "text-white" : "text-gray-900"}>{deletingEmployee?.name}</strong> (DNI: {deletingEmployee?.dni})?
            <br />
            <span className="text-sm">Esta accion eliminara tambien todos sus registros de asistencia.</span>
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={onDeleteEmployee} className="w-full sm:w-auto">
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
