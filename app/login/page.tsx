import type { Metadata } from 'next';
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Ingresar | OvoGest',
  description: 'Sistema de gestión para distribuidoras mayoristas de huevos',
};

export default async function LoginPage(): Promise<React.JSX.Element> {
  // Si ya está autenticado, redirigir al dashboard
  const session = await getAuthSession();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Fondo base */}
      <div className="absolute inset-0 bg-slate-50" />

      {/* Bloque decorativo ámbar - derecha (solo desktop) */}
      <div className="absolute right-0 top-0 w-2/5 h-full bg-amber-900 hidden lg:block" />

      {/* Grid decorativo */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #1E293B 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Contenedor centrado */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <LoginForm />
      </div>
    </div>
  );
}
