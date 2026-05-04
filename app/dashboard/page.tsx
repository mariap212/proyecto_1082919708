import type { Metadata } from 'next';
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard | OvoGest',
  description: 'Panel de control - OvoGest',
};

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-t-amber-600">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Bienvenido, {session.name}
          </h1>
          <p className="text-slate-600 mb-8">
            Rol: <span className="font-semibold text-amber-600">{session.role}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">📦 Inventario</h2>
              <p className="text-slate-600 mb-4">
                Gestiona el stock de huevos y recibe alertas de bajo inventario.
              </p>
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
                Ir al inventario
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">📋 Pedidos</h2>
              <p className="text-slate-600 mb-4">
                Crea, visualiza y gestiona los pedidos de tus clientes mayoristas.
              </p>
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
                Ver pedidos
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">🚚 Entregas</h2>
              <p className="text-slate-600 mb-4">
                Asigna rutas de entrega y sigue el estado de cada entrega en tiempo real.
              </p>
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
                Ver entregas
              </button>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">📊 Reportes</h2>
              <p className="text-slate-600 mb-4">
                Visualiza reportes de ventas, ingresos y análisis financiero.
              </p>
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
                Ver reportes
              </button>
            </div>
          </div>

          {/* Info del sistema */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-600 mb-4">INFORMACIÓN DEL USUARIO</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">ID:</span>
                <p className="text-slate-800 font-mono">{session.id}</p>
              </div>
              <div>
                <span className="text-slate-600">Email:</span>
                <p className="text-slate-800 font-mono">{session.email}</p>
              </div>
            </div>
          </div>

          {/* Botón de logout */}
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

function LogoutButton(): React.JSX.Element {
  return (
    <form
      action={async () => {
        'use server';
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/logout`,
          { method: 'POST' }
        );
        if (response.ok) {
          redirect('/login');
        }
      }}
    >
      <button
        type="submit"
        className="mt-6 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
