import type { Metadata } from 'next';
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import TopNav from '@/components/layout/TopNav';

export const metadata: Metadata = {
  title: 'Ingresar | OvoGest',
  description: 'Sistema de gestión para distribuidoras mayoristas de huevos',
};

export default async function LoginPage(): Promise<React.JSX.Element> {
  const session = await getAuthSession();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_24%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.14),_transparent_20%),linear-gradient(180deg,_#03060e_0%,_#07101e_55%,_#020617_100%)] text-slate-100">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-28 w-96 h-96 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/10 blur-3xl animate-float" />
        <div className="absolute -bottom-36 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-400/20 to-sky-700/10 blur-3xl animate-float" />
        <div className="absolute top-16 left-10 w-60 h-60 rounded-full border border-amber-400/20 opacity-60 blur-sm animate-float" />
        <div className="absolute bottom-24 right-12 w-72 h-72 rounded-full border border-sky-400/15 opacity-50 blur-sm animate-float" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl">
          <TopNav active="login" />
          <div className="glass-card p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-2xl">
            <div className="mb-10 text-center">
              <p className="inline-flex items-center rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200 shadow-sm shadow-amber-500/10">
                ✨ Diseño moderno y animado
              </p>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Bienvenido a OvoGest
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-base text-slate-300 sm:text-lg">
                Accede rápido a tu panel y gestiona inventario, pedidos y entregas con una interfaz fresca y elegante.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="p-6 rounded-[1.75rem] bg-slate-950/80 border border-white/10 shadow-xl shadow-slate-950/20">
                  <LoginForm />
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 shadow-lg shadow-slate-950/15">
                  <p className="text-sm uppercase tracking-[0.24em] text-amber-300 font-semibold">Consejo</p>
                  <p className="mt-3 text-slate-300 text-sm leading-6">
                    Usa las credenciales de prueba para entrar rápidamente y explorar el dashboard sin problemas.
                  </p>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-200">
                      <strong>Usuario:</strong> admin@ovogest.local
                    </div>
                    <div className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-200">
                      <strong>Contraseña:</strong> password123
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.75rem] bg-amber-500/10 border border-amber-300/10 p-6 text-slate-100">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">Bono de bienvenida</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Explora una experiencia con transiciones suaves, controles claros y una paleta moderna pensada para trabajar de forma cómoda todos los días.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
