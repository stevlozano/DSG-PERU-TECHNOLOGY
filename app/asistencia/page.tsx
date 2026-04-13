"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// AlertDialog component not available - using custom implementation with Dialog
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay, isWithinInterval, parse, addMinutes } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarDays, Users, Clock, UserPlus, History, CheckCircle2, ArrowLeft, Search, Pencil, Trash2, DollarSign, GraduationCap } from "lucide-react"

const employeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  type: z.enum(["empleado", "practicante"]),
  email: z.string().email("Email invalido"),
  department: z.string().min(1, "Seleccione un departamento"),
  salary: z.coerce.number().min(0).optional(),
  latePenaltyRate: z.coerce.number().min(0).default(2),
  checkInTime: z.string().default("08:00"),
  checkOutTime: z.string().default("19:00"),
  breakStartTime: z.string().default("13:00"),
  breakEndTime: z.string().default("15:00"),
  maxGrade: z.coerce.number().min(0).max(20).default(20),
  gradePenaltyRate: z.coerce.number().min(0).default(1),
})

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
  breakStartTime: string
  breakEndTime: string
  maxGrade: number
  gradePenaltyRate: number
  currentGrade?: number
}

interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  employeeType: "empleado" | "practicante"
  date: Date
  checkIn?: string
  checkOut?: string
  breakStart?: string
  breakEnd?: string
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

export default function AsistenciaPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [employees, setEmployees] = useState<Employee[]>([
    { 
      id: "1", 
      name: "Juan Perez", 
      type: "empleado", 
      email: "juan@dsg.pe", 
      department: "TI",
      salary: 3500,
      latePenaltyRate: 2,
      checkInTime: "08:00",
      checkOutTime: "19:00",
      breakStartTime: "13:00",
      breakEndTime: "15:00",
      maxGrade: 20,
      gradePenaltyRate: 1
    },
    { 
      id: "2", 
      name: "Maria Garcia", 
      type: "practicante", 
      email: "maria@dsg.pe", 
      department: "Marketing",
      latePenaltyRate: 2,
      checkInTime: "09:00",
      checkOutTime: "13:00",
      breakStartTime: "13:00",
      breakEndTime: "15:00",
      maxGrade: 20,
      gradePenaltyRate: 1
    },
    { 
      id: "3", 
      name: "Carlos Lopez", 
      type: "empleado", 
      email: "carlos@dsg.pe", 
      department: "Ventas",
      salary: 2800,
      latePenaltyRate: 2,
      checkInTime: "08:00",
      checkOutTime: "19:00",
      breakStartTime: "13:00",
      breakEndTime: "15:00",
      maxGrade: 20,
      gradePenaltyRate: 1
    },
  ])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)
  const [filterType, setFilterType] = useState<"dia" | "semana" | "mes">("dia")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTime, setCurrentTime] = useState<string>(format(new Date(), "HH:mm"))
  const [activeTab, setActiveTab] = useState("registro")

  const form = useForm<Employee>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      type: "empleado",
      email: "",
      department: "",
      salary: 0,
      latePenaltyRate: 2,
      checkInTime: "08:00",
      checkOutTime: "19:00",
      breakStartTime: "13:00",
      breakEndTime: "15:00",
      maxGrade: 20,
      gradePenaltyRate: 1,
    },
  })

  const editForm = useForm<Employee>({
    resolver: zodResolver(employeeSchema),
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(format(new Date(), "HH:mm"))
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const calculateLateMinutes = (checkInTime: string, scheduledTime: string): number => {
    const checkIn = parse(checkInTime, "HH:mm", new Date())
    const scheduled = parse(scheduledTime, "HH:mm", new Date())
    if (checkIn <= scheduled) return 0
    const diffMs = checkIn.getTime() - scheduled.getTime()
    return Math.ceil(diffMs / (1000 * 60))
  }

  const calculatePenalty = (record: AttendanceRecord, employee: Employee): Partial<AttendanceRecord> => {
    if (!record.checkIn || record.status !== "tarde") {
      return { lateMinutes: 0, penaltyAmount: 0, pointsDeducted: 0 }
    }
    const lateMinutes = calculateLateMinutes(record.checkIn, employee.checkInTime)
    if (employee.type === "empleado") {
      const penaltyAmount = lateMinutes * (employee.latePenaltyRate || 2)
      return { lateMinutes, penaltyAmount, pointsDeducted: 0 }
    } else {
      const pointsDeducted = lateMinutes * (employee.gradePenaltyRate || 1)
      return { lateMinutes, penaltyAmount: 0, pointsDeducted }
    }
  }

  const calculateCurrentGrade = (employee: Employee): number => {
    if (employee.type !== "practicante") return 0
    const today = format(new Date(), "yyyy-MM-dd")
    const employeeRecords = attendance.filter(
      r => r.employeeId === employee.id && format(r.date, "yyyy-MM-dd") <= today
    )
    let totalPointsLost = 0
    employeeRecords.forEach(record => {
      if (record.pointsDeducted) {
        totalPointsLost += record.pointsDeducted
      }
    })
    return Math.max(0, (employee.maxGrade || 20) - totalPointsLost)
  }

  const handleCheckIn = () => {
    if (!selectedEmployee) return
    const today = format(new Date(), "yyyy-MM-dd")
    const employee = employees.find(e => e.id === selectedEmployee)
    if (!employee) return
    
    const scheduledCheckIn = employee.checkInTime
    const scheduledCheckOut = employee.checkOutTime
    const scheduledBreakStart = employee.breakStartTime
    const scheduledBreakEnd = employee.breakEndTime
    
    const checkInDate = parse(scheduledCheckIn, "HH:mm", new Date())
    const checkInWithToleranceDate = addMinutes(checkInDate, 5)
    const checkInWithTolerance = format(checkInWithToleranceDate, "HH:mm")
    
    const existingRecord = attendance.find(
      record => record.employeeId === selectedEmployee && format(record.date, "yyyy-MM-dd") === today
    )
    
    if (existingRecord) {
      const updatedRecord = { ...existingRecord }
      if (employee.type === "empleado") {
        if (!existingRecord.checkIn) {
          updatedRecord.checkIn = currentTime
          updatedRecord.status = currentTime > checkInWithTolerance ? "tarde" : "presente"
          if (updatedRecord.status === "tarde") {
            const penalty = calculatePenalty(updatedRecord as AttendanceRecord, employee)
            updatedRecord.lateMinutes = penalty.lateMinutes
            updatedRecord.penaltyAmount = penalty.penaltyAmount
            updatedRecord.pointsDeducted = penalty.pointsDeducted
          }
        } else if (!existingRecord.breakStart && currentTime >= scheduledBreakStart) {
          updatedRecord.breakStart = currentTime
        } else if (!existingRecord.breakEnd && currentTime >= scheduledBreakEnd) {
          updatedRecord.breakEnd = currentTime
        } else if (!existingRecord.checkOut && currentTime >= scheduledCheckOut) {
          updatedRecord.checkOut = currentTime
        }
      } else {
        if (!existingRecord.checkIn) {
          updatedRecord.checkIn = currentTime
          updatedRecord.status = currentTime > checkInWithTolerance ? "tarde" : "presente"
          if (updatedRecord.status === "tarde") {
            const penalty = calculatePenalty(updatedRecord as AttendanceRecord, employee)
            updatedRecord.lateMinutes = penalty.lateMinutes
            updatedRecord.penaltyAmount = penalty.penaltyAmount
            updatedRecord.pointsDeducted = penalty.pointsDeducted
          }
        } else if (!existingRecord.checkOut && currentTime >= scheduledCheckOut) {
          updatedRecord.checkOut = currentTime
        }
      }
      setAttendance(attendance.map(record => 
        record.id === existingRecord.id ? updatedRecord : record
      ))
    } else {
      const isLate = currentTime > checkInWithTolerance
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        employeeId: selectedEmployee,
        employeeName: employee.name,
        employeeType: employee.type,
        date: new Date(),
        checkIn: currentTime,
        status: isLate ? "tarde" : "presente"
      }
      if (isLate) {
        const penalty = calculatePenalty(newRecord, employee)
        newRecord.lateMinutes = penalty.lateMinutes
        newRecord.penaltyAmount = penalty.penaltyAmount
        newRecord.pointsDeducted = penalty.pointsDeducted
      }
      setAttendance([...attendance, newRecord])
    }
  }

  const onAddEmployee = (data: Employee) => {
    const newEmployee: Employee = {
      ...data,
      id: Date.now().toString(),
      latePenaltyRate: Number(data.latePenaltyRate) || 2,
      checkInTime: data.checkInTime || "08:00",
      checkOutTime: data.checkOutTime || "19:00",
      breakStartTime: data.breakStartTime || "13:00",
      breakEndTime: data.breakEndTime || "15:00",
      maxGrade: Number(data.maxGrade) || 20,
      gradePenaltyRate: Number(data.gradePenaltyRate) || 1,
    }
    setEmployees([...employees, newEmployee])
    setIsAddEmployeeOpen(false)
    form.reset()
  }

  const onEditEmployee = (data: Employee) => {
    if (!editingEmployee) return
    const updatedEmployee: Employee = {
      ...data,
      id: editingEmployee.id,
      latePenaltyRate: Number(data.latePenaltyRate) || 2,
      checkInTime: data.checkInTime || "08:00",
      checkOutTime: data.checkOutTime || "19:00",
      breakStartTime: data.breakStartTime || "13:00",
      breakEndTime: data.breakEndTime || "15:00",
      maxGrade: Number(data.maxGrade) || 20,
      gradePenaltyRate: Number(data.gradePenaltyRate) || 1,
    }
    setEmployees(employees.map(emp => emp.id === editingEmployee.id ? updatedEmployee : emp))
    setIsEditEmployeeOpen(false)
    setEditingEmployee(null)
    editForm.reset()
  }

  const onDeleteEmployee = () => {
    if (!deletingEmployee) return
    setEmployees(employees.filter(emp => emp.id !== deletingEmployee.id))
    setAttendance(attendance.filter(record => record.employeeId !== deletingEmployee.id))
    setIsDeleteDialogOpen(false)
    setDeletingEmployee(null)
  }

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee)
    editForm.reset({
      ...employee,
      salary: employee.salary || 0,
      latePenaltyRate: employee.latePenaltyRate || 2,
      maxGrade: employee.maxGrade || 20,
      gradePenaltyRate: employee.gradePenaltyRate || 1,
    })
    setIsEditEmployeeOpen(true)
  }

  const openDeleteDialog = (employee: Employee) => {
    setDeletingEmployee(employee)
    setIsDeleteDialogOpen(true)
  }

  const getCheckButtonText = () => {
    if (!selectedEmployee) return "Selecciona tu nombre"
    const today = format(new Date(), "yyyy-MM-dd")
    const record = attendance.find(
      r => r.employeeId === selectedEmployee && format(r.date, "yyyy-MM-dd") === today
    )
    const employee = employees.find(e => e.id === selectedEmployee)
    if (!record) return "Registrar entrada"
    if (employee?.type === "empleado") {
      if (!record.checkIn) return "Registrar entrada"
      if (!record.breakStart && currentTime >= employee.breakStartTime) return "Inicio receso"
      if (!record.breakEnd && currentTime >= employee.breakEndTime) return "Fin receso"
      if (!record.checkOut && currentTime >= employee.checkOutTime) return "Registrar salida"
      return "Registro completo"
    } else {
      if (!record.checkIn) return "Registrar entrada"
      if (!record.checkOut && currentTime >= employee.checkOutTime) return "Registrar salida"
      return "Registro completo"
    }
  }

  const getFilteredAttendance = () => {
    const now = new Date()
    let startDate: Date
    let endDate: Date
    switch (filterType) {
      case "dia":
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        break
      case "semana":
        startDate = startOfWeek(now, { weekStartsOn: 1 })
        endDate = endOfWeek(now, { weekStartsOn: 1 })
        break
      case "mes":
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      default:
        startDate = startOfDay(now)
        endDate = endOfDay(now)
    }
    return attendance.filter(record => 
      isWithinInterval(record.date, { start: startDate, end: endDate })
    )
  }

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTodayStats = () => {
    const today = format(new Date(), "yyyy-MM-dd")
    const todayRecords = attendance.filter(r => format(r.date, "yyyy-MM-dd") === today)
    return {
      total: employees.length,
      present: todayRecords.filter(r => r.status === "presente").length,
      late: todayRecords.filter(r => r.status === "tarde").length,
      absent: employees.length - todayRecords.length,
    }
  }

  const stats = getTodayStats()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-medium tracking-tight">Asistencia</h1>
                <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE, d MMMM yyyy", { locale: es })}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-light">{currentTime}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-none bg-muted/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total</p>
              <p className="text-2xl font-light">{stats.total}</p>
              <p className="text-xs text-muted-foreground">colaboradores</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-none bg-emerald-50 dark:bg-emerald-950/20">
            <CardContent className="p-4">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Presentes</p>
              <p className="text-2xl font-light text-emerald-600 dark:text-emerald-400">{stats.present}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-none bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Tarde</p>
              <p className="text-2xl font-light text-amber-600 dark:text-amber-400">{stats.late}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-none bg-rose-50 dark:bg-rose-950/20">
            <CardContent className="p-4">
              <p className="text-xs text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">Ausentes</p>
              <p className="text-2xl font-light text-rose-600 dark:text-rose-400">{stats.absent}</p>
            </CardContent>
          </Card>
        </div>

        <section className="mb-8">
          <Card className="border">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Colaborador</label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecciona tu nombre" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          <div className="flex items-center gap-3">
                            <span>{employee.name}</span>
                            <Badge variant={employee.type === "empleado" ? "default" : "secondary"} className="text-[10px]">
                              {employee.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleCheckIn} 
                    disabled={!selectedEmployee || getCheckButtonText() === "Registro completo"}
                    size="lg"
                    className="h-12 px-8"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {getCheckButtonText()}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-8">
            <TabsTrigger 
              value="registro" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent pb-3 px-0"
            >
              Registros
            </TabsTrigger>
            <TabsTrigger 
              value="calendario"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent pb-3 px-0"
            >
              Calendario
            </TabsTrigger>
            <TabsTrigger 
              value="personal"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent pb-3 px-0"
            >
              Personal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registro" className="space-y-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Historial de asistencia</h2>
              <Select value={filterType} onValueChange={(value: "dia" | "semana" | "mes") => setFilterType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Hoy</SelectItem>
                  <SelectItem value="semana">Esta semana</SelectItem>
                  <SelectItem value="mes">Este mes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-medium">Colaborador</TableHead>
                    <TableHead className="font-medium">Fecha</TableHead>
                    <TableHead className="font-medium">Entrada</TableHead>
                    <TableHead className="font-medium">Salida</TableHead>
                    <TableHead className="font-medium">Estado</TableHead>
                    <TableHead className="font-medium">Penalizacion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredAttendance().map(record => (
                    <TableRow key={record.id} className="border-b last:border-0">
                      <TableCell>
                        <div className="font-medium">{record.employeeName}</div>
                        <div className="text-xs text-muted-foreground">{record.employeeType}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{format(record.date, "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        {record.checkIn || "—"}
                        {record.lateMinutes && record.lateMinutes > 0 && (
                          <span className="text-xs text-red-600 block">+{record.lateMinutes} min tarde</span>
                        )}
                      </TableCell>
                      <TableCell>{record.checkOut || "—"}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={record.status === "presente" ? "default" : record.status === "tarde" ? "secondary" : "destructive"}
                          className="text-xs capitalize"
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.status === "tarde" && record.employeeType === "empleado" && record.penaltyAmount ? (
                          <div className="flex items-center gap-1 text-red-600 text-sm">
                            <DollarSign className="w-3 h-3" />
                            <span className="font-medium">- S/. {record.penaltyAmount.toFixed(2)}</span>
                          </div>
                        ) : record.status === "tarde" && record.employeeType === "practicante" && record.pointsDeducted ? (
                          <div className="flex items-center gap-1 text-amber-600 text-sm">
                            <GraduationCap className="w-3 h-3" />
                            <span className="font-medium">- {record.pointsDeducted.toFixed(1)} pts</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {getFilteredAttendance().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                        No hay registros para el periodo seleccionado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="calendario" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border">
                <CardContent className="p-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={es}
                    className="mx-auto"
                  />
                </CardContent>
              </Card>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                </h3>
                <div className="space-y-3">
                  {attendance
                    .filter(record => format(record.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
                    .map(record => (
                      <Card key={record.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{record.employeeName}</p>
                              <p className="text-xs text-muted-foreground">{record.employeeType}</p>
                            </div>
                            <Badge 
                              variant={record.status === "presente" ? "default" : record.status === "tarde" ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              {record.status}
                            </Badge>
                          </div>
                          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground grid grid-cols-3 gap-2">
                            <div>
                              <span className="block text-[10px] uppercase tracking-wider">Entrada</span>
                              <span>{record.checkIn || "—"}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] uppercase tracking-wider">Receso</span>
                              <span>{record.breakStart ? `${record.breakStart}-${record.breakEnd || "..."}` : "—"}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] uppercase tracking-wider">Salida</span>
                              <span>{record.checkOut || "—"}</span>
                            </div>
                          </div>
                          {record.status === "tarde" && (
                            <div className="mt-2 pt-2 border-t">
                              {record.employeeType === "empleado" && record.penaltyAmount ? (
                                <div className="flex items-center gap-1 text-red-600 text-sm">
                                  <DollarSign className="w-3 h-3" />
                                  <span>Descuento: S/. {record.penaltyAmount.toFixed(2)}</span>
                                </div>
                              ) : record.employeeType === "practicante" && record.pointsDeducted ? (
                                <div className="flex items-center gap-1 text-amber-600 text-sm">
                                  <GraduationCap className="w-3 h-3" />
                                  <span>Puntos perdidos: {record.pointsDeducted.toFixed(1)}</span>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  {attendance.filter(record => format(record.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")).length === 0 && (
                    <p className="text-muted-foreground text-center py-8">Sin registros para esta fecha</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="personal" className="space-y-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-medium">Equipo DSG</h2>
                <span className="text-sm text-muted-foreground">{employees.length} colaboradores</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar..." 
                    className="pl-9 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={() => setIsAddEmployeeOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Nuevo
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-medium">Nombre</TableHead>
                    <TableHead className="font-medium">Tipo</TableHead>
                    <TableHead className="font-medium">Departamento</TableHead>
                    <TableHead className="font-medium">Sueldo/Nota</TableHead>
                    <TableHead className="font-medium">Horario</TableHead>
                    <TableHead className="font-medium w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map(employee => {
                    const currentGrade = calculateCurrentGrade(employee)
                    return (
                      <TableRow key={employee.id} className="border-b last:border-0">
                        <TableCell>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-xs text-muted-foreground">{employee.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={employee.type === "empleado" ? "default" : "secondary"} className="text-xs capitalize">
                            {employee.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{departments.find(d => d.value === employee.department)?.label || employee.department}</TableCell>
                        <TableCell>
                          {employee.type === "empleado" ? (
                            <div className="flex items-center gap-1 text-sm">
                              <DollarSign className="w-3 h-3" />
                              <span>S/. {employee.salary?.toLocaleString() || "0"}</span>
                              <span className="text-xs text-muted-foreground">/mes</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-sm">
                              <GraduationCap className="w-3 h-3" />
                              <span className={currentGrade < 10 ? "text-red-600 font-medium" : ""}>
                                {currentGrade.toFixed(1)}/{employee.maxGrade}
                              </span>
                              <span className="text-xs text-muted-foreground">pts</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <span className="text-muted-foreground">Entrada:</span> {employee.checkInTime}
                            <br />
                            <span className="text-muted-foreground">Salida:</span> {employee.checkOutTime}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => openEditDialog(employee)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openDeleteDialog(employee)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredEmployees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                        No se encontraron resultados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Nuevo colaborador</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddEmployee)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Perez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="empleado">Empleado</SelectItem>
                          <SelectItem value="practicante">Practicante</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="nombre@dsg.pe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Configuracion de horario</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="checkInTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora entrada</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="checkOutTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora salida</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {form.watch("type") === "empleado" && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Configuracion salarial</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sueldo mensual (S/.)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="100" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="latePenaltyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descuento por min tarde (S/.)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.5" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {form.watch("type") === "practicante" && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Configuracion de nota</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maxGrade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nota maxima</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="20" step="1" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gradePenaltyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Puntos por min tarde</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.5" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Agregar colaborador</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditEmployeeOpen} onOpenChange={setIsEditEmployeeOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Editar colaborador</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditEmployee)} className="space-y-4 mt-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Perez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="empleado">Empleado</SelectItem>
                          <SelectItem value="practicante">Practicante</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="nombre@dsg.pe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Configuracion de horario</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="checkInTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora entrada</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="checkOutTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora salida</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={editForm.control}
                    name="breakStartTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inicio receso</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="breakEndTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fin receso</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {editForm.watch("type") === "empleado" && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Configuracion salarial</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sueldo mensual (S/.)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="100" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="latePenaltyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descuento por min tarde (S/.)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.5" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {editForm.watch("type") === "practicante" && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Configuracion de nota</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="maxGrade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nota maxima</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="20" step="1" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="gradePenaltyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Puntos por min tarde</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.5" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditEmployeeOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar cambios</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-red-600">Eliminar colaborador</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Esta seguro de eliminar a <strong className="text-foreground">{deletingEmployee?.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta accion no se puede deshacer y eliminara todos sus registros de asistencia.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={onDeleteEmployee} variant="destructive">
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
