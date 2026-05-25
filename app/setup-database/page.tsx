'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Database, Loader2 } from 'lucide-react';

interface SetupStatus {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function SetupDatabasePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<SetupStatus | null>(null);

  const handleSetupDatabase = async () => {
    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          message: 'Base de datos inicializada exitosamente con datos seed.',
          type: 'success'
        });
      } else {
        setStatus({
          message: data.error || 'Error al inicializar la base de datos.',
          type: 'error'
        });
      }
    } catch (error) {
      setStatus({
        message: 'Error de conexión al inicializar la base de datos.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Configuración de Base de Datos
          </CardTitle>
          <CardDescription className="text-gray-600">
            Inicializa la base de datos de OvoGest con datos seed para comenzar a operar
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Datos que se inicializarán:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Tipos de huevos (A, AA, B, C)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Proveedores de ejemplo
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Configuración inicial del sistema
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Usuario administrador por defecto
              </li>
            </ul>
          </div>

          {status && (
            <Alert className={`${
              status.type === 'success'
                ? 'border-green-200 bg-green-50'
                : status.type === 'error'
                ? 'border-red-200 bg-red-50'
                : 'border-blue-200 bg-blue-50'
            }`}>
              {status.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : status.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-blue-600" />
              )}
              <AlertDescription className={`${
                status.type === 'success'
                  ? 'text-green-800'
                  : status.type === 'error'
                  ? 'text-red-800'
                  : 'text-blue-800'
              }`}>
                {status.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleSetupDatabase}
              disabled={isLoading}
              size="lg"
              className="px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Inicializando...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Inicializar Base de Datos
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Esta acción solo debe ejecutarse una vez al iniciar el sistema.</p>
            <p>Si ya has inicializado la base de datos, puedes ir al <a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a>.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}