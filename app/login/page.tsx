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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Fondo animado con gradientes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Elemento decorativo 1 - ámbar */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/30 to-amber-600/20 rounded-full blur-3xl" />
        
        {/* Elemento decorativo 2 - ámbar */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-amber-500/20 to-amber-700/10 rounded-full blur-3xl" />
        
        {/* Líneas decorativas */}
        <div className="absolute top-20 left-1/4 w-72 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-60 rotate-45" />
        <div className="absolute bottom-32 right-1/3 w-96 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-40 -rotate-45" />
      </div>

      {/* Grid de puntos sutil */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(251, 191, 36, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Contenedor centrado con contenido */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 w-full flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
