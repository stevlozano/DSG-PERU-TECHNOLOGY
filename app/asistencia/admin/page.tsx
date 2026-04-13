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
import { ArrowLeft, UserPlus, Pencil, Trash2, DollarSign, GraduationCap, Clock, Moon, Sun, Users } from "lucide-react"

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
  { value: "Operaciones", label: "Operaciones" },
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
  const subCardBg = isDarkMode ? "bg-[#1a1a1a]" : "bg-gray-100"

  // Load employees and attendance from localStorage
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
  
  // Save to localStorage whenever data changes
  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem("dsg-employees", JSON.stringify(employees))
    }
  }, [employees])
  
  useEffect(() => {
    localStorage.setItem("dsg-attendance", JSON.stringify(attendance))
  }, [attendance])

  // Add employee form state
  const [isAddOpen, setIsAddOpen] = useState(false)
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
  })

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTime, setCurrentTime] = useState(format(new Date(), "HH:mm"))

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(format(new Date(), "HH:mm")), 60000)
    return () => clearInterval(timer)
  }, [])

  const handleAddEmployee = () => {
    if (!newEmployee.dni || !newEmployee.name || !newEmployee.email) {
      alert("Complete todos los campos obligatorios")
      return
    }

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
    }

    setEmployees([...employees, employee])
    setIsAddOpen(false)
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
    })
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

  const todayRecords = attendance.filter(r => format(r.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"))

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <header className={`border-b ${headerBorder}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/asistencia">
                <Button variant="ghost" size="icon" className={`h-8 w-8 ${mutedText}`}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Panel Administrador</h1>
                <p className={`text-xs ${mutedText}`}>Gestion de Personal y Asistencia</p>
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
                <p className="text-2xl font-light">{currentTime}</p>
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
              <p className={`text-xs ${mutedText} uppercase mb-1`}>Total Personal</p>
              <p className="text-2xl font-light flex items-center gap-2">
                <Users className="w-5 h-5" />
                {employees.length}
              </p>
            </CardContent>
          </Card>
          <Card className={`border ${cardBg}`}>
            <CardContent className="p-4">
              <p className={`text-xs ${mutedText} uppercase mb-1`}>Empleados</p>
              <p className="text-2xl font-light text-blue-400">
                {employees.filter(e => e.type === "empleado").length}
              </p>
            </CardContent>
          </Card>
          <Card className={`border ${cardBg}`}>
            <CardContent className="p-4">
              <p className={`text-xs ${mutedText} uppercase mb-1`}>Practicantes</p>
              <p className="text-2xl font-light text-purple-400">
                {employees.filter(e => e.type === "practicante").length}
              </p>
            </CardContent>
          </Card>
          <Card className={`border ${cardBg}`}>
            <CardContent className="p-4">
              <p className={`text-xs ${mutedText} uppercase mb-1`}>Registros Hoy</p>
              <p className="text-2xl font-light text-green-400">{todayRecords.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Employees Table */}
        <Card className={`border ${cardBg}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Users className="w-5 h-5" />
                Personal Registrado
              </h2>
              <div className="flex gap-3">
                <Input 
                  placeholder="Buscar por nombre o DNI..." 
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
                    <TableHead className={mutedText}>DNI</TableHead>
                    <TableHead className={mutedText}>Nombre</TableHead>
                    <TableHead className={mutedText}>Tipo</TableHead>
                    <TableHead className={mutedText}>Depto</TableHead>
                    <TableHead className={mutedText}>Horario</TableHead>
                    <TableHead className={mutedText}>Sueldo/Nota</TableHead>
                    <TableHead className={mutedText}>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map(emp => (
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
                        <Clock className="w-3 h-3 inline mr-1" />
                        {emp.checkInTime} - {emp.checkOutTime}
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
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card className={`border ${cardBg} mt-8`}>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Historial de Asistencia General</h2>
            <div className={`border ${tableBorder} rounded-lg overflow-hidden`}>
              <Table>
                <TableHeader>
                  <TableRow className={`${tableBorder} hover:bg-transparent`}>
                    <TableHead className={mutedText}>Fecha</TableHead>
                    <TableHead className={mutedText}>Colaborador</TableHead>
                    <TableHead className={mutedText}>Entrada</TableHead>
                    <TableHead className={mutedText}>Estado</TableHead>
                    <TableHead className={mutedText}>Penalizacion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.slice().reverse().slice(0, 20).map(record => (
                    <TableRow key={record.id} className={tableBorder}>
                      <TableCell className={mutedText}>
                        {format(record.date, "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{record.employeeName}</TableCell>
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
                      <TableCell colSpan={5} className={`text-center ${mutedText} py-8`}>
                        No hay registros de asistencia
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
        <DialogContent className={`${isDarkMode ? "bg-[#141414] border-[#2a2a2a] text-white" : "bg-white border-gray-200"} max-w-2xl max-h-[90vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle className="text-xl">Registrar Nuevo Colaborador</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className={`p-4 ${subCardBg} rounded-lg space-y-3`}>
              <h4 className="font-medium text-sm">Informacion Basica</h4>
              <div className="grid grid-cols-2 gap-3">
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
              <div className="grid grid-cols-2 gap-3">
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

            {/* Schedule */}
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

            {/* Salary / Grade Configuration */}
            {newEmployee.type === "empleado" ? (
              <div className={`p-4 ${subCardBg} rounded-lg space-y-3`}>
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Configuracion Salarial
                </h4>
                <div className="grid grid-cols-2 gap-3">
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
                <div className="grid grid-cols-2 gap-3">
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

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddEmployee} className="bg-blue-600 hover:bg-blue-700">
                Guardar Colaborador
              </Button>
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
            Esta seguro de eliminar a <strong className={isDarkMode ? "text-white" : "text-gray-900"}>{deletingEmployee?.name}</strong> (DNI: {deletingEmployee?.dni})?
            <br />
            Esta accion eliminara tambien todos sus registros de asistencia.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={onDeleteEmployee}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
