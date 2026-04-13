"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, User, GraduationCap, ArrowLeft } from "lucide-react"

export default function AsistenciaLandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <header className="border-b border-[#2a2a2a]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Portal de Asistencia</h1>
              <p className="text-xs text-gray-400">DSG Peru Technology</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Selecciona tu perfil</h2>
            <p className="text-gray-400">Elige el portal correspondiente a tu rol en la empresa</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin / Ingeniero */}
            <Link href="/asistencia/admin">
              <Card className="bg-[#141414] border-[#2a2a2a] hover:border-blue-600 transition-all cursor-pointer group h-full">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors">
                    <Shield className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Administrador</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Portal del ingeniero para gestionar personal, sueldos, y configurar el sistema de asistencia.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Acceder
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Empleado */}
            <Link href="/asistencia/empleado">
              <Card className="bg-[#141414] border-[#2a2a2a] hover:border-green-600 transition-all cursor-pointer group h-full">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-green-600/20 flex items-center justify-center mb-4 group-hover:bg-green-600/30 transition-colors">
                    <User className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Empleado</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Portal para personal contratado. Ver su sueldo, descuentos por tardanzas y registrar asistencia.
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Acceder
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Practicante */}
            <Link href="/asistencia/practicante">
              <Card className="bg-[#141414] border-[#2a2a2a] hover:border-purple-600 transition-all cursor-pointer group h-full">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center mb-4 group-hover:bg-purple-600/30 transition-colors">
                    <GraduationCap className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Practicante</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Portal para practicantes. Ver tu nota actual, puntos perdidos por tardanzas y registrar asistencia.
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Acceder
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Sistema de Asistencia DSG v2.0
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
