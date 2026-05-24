import type { Metadata } from 'next';
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';

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
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.12),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.08),_transparent_30%),linear-gradient(180deg,_#07101e_0%,_#020617_100%)] p-6 text-slate-100">
      <div className="relative mx-auto max-w-6xl">
        <TopNav active="dashboard" />
        <div className="absolute top-6 left-4 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-8 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

        <section className="relative glass-card overflow-hidden rounded-[2rem] border border-white/10 p-8 shadow-2xl shadow-slate-950/30">
          <div className="mb-8 grid gap-6 md:grid-cols-[1.6fr_0.8fr]">
            <div className="space-y-4">
              <p className="inline-flex items-center rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">
                Dashboard
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Hola, {session.name}
              </h1>
              <p className="max-w-2xl text-slate-300 leading-7">
                Tu centro de control moderno para supervisar inventario, pedidos, entregas y reportes con claridad y velocidad.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Rol activo</p>
              <p className="mt-4 text-2xl font-semibold text-white">{session.role}</p>
              <div className="mt-6 space-y-3 text-sm text-slate-300">
                <p>ID de sesión:</p>
                <p className="rounded-2xl bg-slate-900/80 px-4 py-3 font-mono text-slate-200">{session.id}</p>
                <p>Email:</p>
                <p className="rounded-2xl bg-slate-900/80 px-4 py-3 font-mono text-slate-200">{session.email}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-6 transition duration-300 hover:-translate-y-1 hover:border-amber-300/20 hover:bg-slate-900/95 shadow-lg shadow-slate-950/20">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20">
                📦
              </div>
              <h2 className="text-xl font-semibold text-white">Inventario</h2>
              <p className="mt-3 text-slate-400">Controla el stock y recibe alertas de producto bajo de forma sencilla.</p>
              <button className="mt-6 inline-flex items-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-amber-600 hover:to-amber-700">
                Explorar
              </button>
            </div>
            <div className="group rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-6 transition duration-300 hover:-translate-y-1 hover:border-sky-300/20 hover:bg-slate-900/95 shadow-lg shadow-slate-950/20">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/20">
                📋
              </div>
              <h2 className="text-xl font-semibold text-white">Pedidos</h2>
              <p className="mt-3 text-slate-400">Crea y administra pedidos con un flujo claro y visual.</p>
              <button className="mt-6 inline-flex items-center rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-sky-600 hover:to-cyan-600">
                Ir a pedidos
              </button>
            </div>
            <div className="group rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/20 hover:bg-slate-900/95 shadow-lg shadow-slate-950/20">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
                🚚
              </div>
              <h2 className="text-xl font-semibold text-white">Entregas</h2>
              <p className="mt-3 text-slate-400">Organiza rutas y sigue el estado de cada envío con rapidez.</p>
              <button className="mt-6 inline-flex items-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-emerald-600 hover:to-teal-600">
                Ver entregas
              </button>
            </div>
            <div className="group rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-300/20 hover:bg-slate-900/95 shadow-lg shadow-slate-950/20">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
                📊
              </div>
              <h2 className="text-xl font-semibold text-white">Reportes</h2>
              <p className="mt-3 text-slate-400">Visualiza métricas clave y tendencias con un vistazo rápido.</p>
              <button className="mt-6 inline-flex items-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-violet-600 hover:to-fuchsia-600">
                Ver reportes
              </button>
            </div>
          </div>

          <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-slate-950/20">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Detalles de usuario</p>
                <p className="mt-3 text-slate-200">Tu cuenta está activa y lista para administrar todas las áreas importantes del negocio.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-900/80 px-5 py-4 text-sm text-slate-200">
                  <p className="text-slate-400">ID</p>
                  <p className="mt-2 font-semibold">{session.id}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 px-5 py-4 text-sm text-slate-200">
                  <p className="text-slate-400">Email</p>
                  <p className="mt-2 font-semibold">{session.email}</p>
                </div>
              </div>
            </div>

            <LogoutButton />
          </div>
        </section>
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
        className="mt-6 w-full rounded-3xl bg-gradient-to-r from-red-500 to-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:from-red-600 hover:to-rose-600"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
