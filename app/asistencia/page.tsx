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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay, isWithinInterval } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarDays, Users, Clock, UserPlus, History, CheckCircle2, ArrowLeft, Search } from "lucide-react"

const employeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  type: z.enum(["empleado", "practicante"]),
  email: z.string().email("Email inválido"),
  department: z.string().min(1, "Seleccione un departamento"),
})

interface Employee {
  id: string
  name: string
  type: "empleado" | "practicante"
  email: string
  department: string
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
}

const departments = [
  { value: "TI", label: "Tecnología" },
  { value: "Marketing", label: "Marketing" },
  { value: "Ventas", label: "Ventas" },
  { value: "RRHH", label: "Recursos Humanos" },
  { value: "Finanzas", label: "Finanzas" },
  { value: "Operaciones", label: "Operaciones" },
]

export default function AsistenciaPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [employees, setEmployees] = useState<Employee[]>([
    { id: "1", name: "Juan Pérez", type: "empleado", email: "juan@dsg.pe", department: "TI" },
    { id: "2", name: "María García", type: "practicante", email: "maria@dsg.pe", department: "Marketing" },
    { id: "3", name: "Carlos López", type: "empleado", email: "carlos@dsg.pe", department: "Ventas" },
  ])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([
    { id: "1", employeeId: "1", employeeName: "Juan Pérez", employeeType: "empleado", date: new Date(), checkIn: "08:00", breakStart: "13:00", breakEnd: "15:00", checkOut: "19:00", status: "presente" },
    { id: "2", employeeId: "2", employeeName: "María García", employeeType: "practicante", date: new Date(), checkIn: "09:00", checkOut: "13:00", status: "presente" },
  ])
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
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
    },
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(format(new Date(), "HH:mm"))
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const handleCheckIn = () => {
    if (!selectedEmployee) return
    
    const today = format(new Date(), "yyyy-MM-dd")
    const employee = employees.find(e => e.id === selectedEmployee)
    if (!employee) return
    
    const existingRecord = attendance.find(
      record => record.employeeId === selectedEmployee && format(record.date, "yyyy-MM-dd") === today
    )
    
    if (existingRecord) {
      const updatedRecord = { ...existingRecord }
      
      if (employee.type === "empleado") {
        if (!existingRecord.checkIn) {
          updatedRecord.checkIn = currentTime
          updatedRecord.status = currentTime > "08:05" ? "tarde" : "presente"
        } else if (!existingRecord.breakStart && currentTime >= "13:00") {
          updatedRecord.breakStart = currentTime
        } else if (!existingRecord.breakEnd && currentTime >= "15:00") {
          updatedRecord.breakEnd = currentTime
        } else if (!existingRecord.checkOut && currentTime >= "19:00") {
          updatedRecord.checkOut = currentTime
        }
      } else {
        if (!existingRecord.checkIn) {
          updatedRecord.checkIn = currentTime
          updatedRecord.status = currentTime > "09:05" ? "tarde" : "presente"
        } else if (!existingRecord.checkOut && currentTime >= "13:00") {
          updatedRecord.checkOut = currentTime
        }
      }
      
      setAttendance(attendance.map(record => 
        record.id === existingRecord.id ? updatedRecord : record
      ))
    } else {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        employeeId: selectedEmployee,
        employeeName: employee.name,
        employeeType: employee.type,
        date: new Date(),
        checkIn: currentTime,
        status: employee.type === "empleado" 
          ? (currentTime > "08:05" ? "tarde" : "presente")
          : (currentTime > "09:05" ? "tarde" : "presente")
      }
      setAttendance([...attendance, newRecord])
    }
  }

  const onAddEmployee = (data: Employee) => {
    const newEmployee = { ...data, id: Date.now().toString() }
    setEmployees([...employees, newEmployee])
    setIsAddEmployeeOpen(false)
    form.reset()
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
      if (!record.breakStart && currentTime >= "13:00") return "Inicio receso"
      if (!record.breakEnd && currentTime >= "15:00") return "Fin receso"
      if (!record.checkOut && currentTime >= "19:00") return "Registrar salida"
      return "Registro completo"
    } else {
      if (!record.checkIn) return "Registrar entrada"
      if (!record.checkOut && currentTime >= "13:00") return "Registrar salida"
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
      {/* Header minimalista */}
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
        {/* Stats minimalistas */}
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

        {/* Registro rápido */}
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

        {/* Tabs contenido */}
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
                    <TableHead className="font-medium">Receso</TableHead>
                    <TableHead className="font-medium">Salida</TableHead>
                    <TableHead className="font-medium">Estado</TableHead>
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
                      <TableCell>{record.checkIn || "—"}</TableCell>
                      <TableCell>
                        {record.breakStart ? (
                          <span className="text-xs">{record.breakStart} - {record.breakEnd || "..."}</span>
                        ) : "—"}
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
                    </TableRow>
                  ))}
                  {getFilteredAttendance().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                        No hay registros para el período seleccionado
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
                    <TableHead className="font-medium">Email</TableHead>
                    <TableHead className="font-medium">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map(employee => (
                    <TableRow key={employee.id} className="border-b last:border-0">
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>
                        <Badge variant={employee.type === "empleado" ? "default" : "secondary"} className="text-xs capitalize">
                          {employee.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{departments.find(d => d.value === employee.department)?.label || employee.department}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{employee.email}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                          Activo
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
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

      {/* Dialog agregar empleado */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="sm:max-w-md">
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
                      <Input placeholder="Ej: Juan Pérez" {...field} />
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
    </div>
  )
}
