"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { CalendarDays, Users, Clock, UserPlus, History, Filter, CheckCircle, XCircle, Moon, Sun } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

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

export default function AsistenciaPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [employees, setEmployees] = useState<Employee[]>([
    { id: "1", name: "Juan Pérez", type: "empleado", email: "juan@company.com", department: "TI" },
    { id: "2", name: "María García", type: "practicante", email: "maria@company.com", department: "Marketing" },
  ])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([
    { id: "1", employeeId: "1", employeeName: "Juan Pérez", employeeType: "empleado", date: new Date(), checkIn: "08:00", breakStart: "13:00", breakEnd: "15:00", checkOut: "19:00", status: "presente" },
    { id: "2", employeeId: "2", employeeName: "María García", employeeType: "practicante", date: new Date(), checkIn: "09:00", checkOut: "13:00", status: "presente" },
  ])
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [filterType, setFilterType] = useState<"dia" | "semana" | "mes">("dia")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [currentTime, setCurrentTime] = useState<string>(format(new Date(), "HH:mm"))

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
        // Lógica para empleados con receso
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
        // Lógica para practicantes
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
      // Nuevo registro
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
    
    if (!record) return "Check In"
    
    if (employee?.type === "empleado") {
      if (!record.checkIn) return "Check In"
      if (!record.breakStart && currentTime >= "13:00") return "Inicio Receso"
      if (!record.breakEnd && currentTime >= "15:00") return "Fin Receso"
      if (!record.checkOut && currentTime >= "19:00") return "Check Out"
      return "Registro Completo"
    } else {
      if (!record.checkIn) return "Check In"
      if (!record.checkOut && currentTime >= "13:00") return "Check Out"
      return "Registro Completo"
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

  const getTotalEmployees = () => employees.length
  const getTotalPresent = () => getFilteredAttendance().filter(a => a.status === "presente").length
  const getTotalLate = () => getFilteredAttendance().filter(a => a.status === "tarde").length
  const getTotalAbsent = () => getFilteredAttendance().filter(a => a.status === "ausente").length

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-wide">Asistencia DSG</h1>
            <p className="text-sm text-muted-foreground">Gestión de asistencia</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                Inicio
              </Button>
            </Link>
            <ThemeToggle />
            <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Personal</DialogTitle>
                  <DialogDescription>
                    Registra un nuevo empleado o practicante en el sistema
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onAddEmployee)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingrese el nombre completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione el tipo" />
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="correo@empresa.com" {...field} />
                          </FormControl>
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
                                <SelectValue placeholder="Seleccione el departamento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="TI">Tecnología</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                              <SelectItem value="Ventas">Ventas</SelectItem>
                              <SelectItem value="RRHH">Recursos Humanos</SelectItem>
                              <SelectItem value="Finanzas">Finanzas</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Agregar</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Card className="border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu nombre" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center gap-2">
                        <span>{employee.name}</span>
                        <Badge variant={employee.type === "empleado" ? "default" : "secondary"} className="text-xs">
                          {employee.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-light">{currentTime}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(), "EEEE d MMMM", { locale: es })}
                </div>
              </div>
              <Button 
                onClick={handleCheckIn} 
                disabled={!selectedEmployee}
                size="lg"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {getCheckButtonText()}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-light">{getTotalEmployees()}</div>
            <p className="text-xs text-muted-foreground">
              {employees.filter(e => e.type === "empleado").length} emp, {employees.filter(e => e.type === "practicante").length} prac
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-light text-green-600">{getTotalPresent()}</div>
            <p className="text-xs text-muted-foreground">Presentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-light text-yellow-600">{getTotalLate()}</div>
            <p className="text-xs text-muted-foreground">Tarde</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-light text-red-600">{getTotalAbsent()}</div>
            <p className="text-xs text-muted-foreground">Ausentes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendario" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
        </TabsList>

        <TabsContent value="calendario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-light flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Calendario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={es}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-light mb-4">
                    {format(selectedDate, "d 'de' MMMM", { locale: es })}
                  </h3>
                  <div className="space-y-2">
                    {attendance
                      .filter(record => format(record.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
                      .map(record => (
                        <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant={record.status === "presente" ? "default" : record.status === "tarde" ? "secondary" : "destructive"} className="text-xs">
                              {record.status}
                            </Badge>
                            <span className="text-sm">{record.employeeName}</span>
                            <Badge variant="outline" className="text-xs">
                              {record.employeeType}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {record.checkIn || "-"} 
                            {record.breakStart && ` · Receso: ${record.breakStart}-${record.breakEnd || "-"}`}
                            {record.checkOut && ` · Salida: ${record.checkOut}`}
                          </div>
                        </div>
                      ))}
                    {attendance.filter(record => format(record.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")).length === 0 && (
                      <p className="text-muted-foreground text-center py-8 text-sm">Sin registros</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-light flex items-center gap-2">
                <History className="w-4 h-4" />
                Historial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Filter className="w-4 h-4" />
                <Select value={filterType} onValueChange={(value: "dia" | "semana" | "mes") => setFilterType(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dia">Hoy</SelectItem>
                    <SelectItem value="semana">Esta semana</SelectItem>
                    <SelectItem value="mes">Este mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Receso</TableHead>
                    <TableHead>Salida</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredAttendance().map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.employeeName}</TableCell>
                      <TableCell>{format(record.date, "dd/MM/yyyy")}</TableCell>
                      <TableCell>{record.checkIn || "-"}</TableCell>
                      <TableCell>{record.breakStart && record.breakEnd ? `${record.breakStart}-${record.breakEnd}` : record.breakStart ? `${record.breakStart}-` : "-"}</TableCell>
                      <TableCell>{record.checkOut || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={record.status === "presente" ? "default" : record.status === "tarde" ? "secondary" : "destructive"}>
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {getFilteredAttendance().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No hay registros para el período seleccionado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-light flex items-center gap-2">
                <Users className="w-4 h-4" />
                Personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map(employee => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>
                        <Badge variant={employee.type === "empleado" ? "default" : "secondary"}>
                          {employee.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          Activo
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
