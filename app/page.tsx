import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';

export const metadata: Metadata = {
  title: 'OvoGest | Gestión de distribución mayorista',
  description: 'Sistema de gestión para distribuidoras mayoristas de huevos',
};

export default async function HomePage(): Promise<React.JSX.Element> {
  const session = await getAuthSession();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.08),_transparent_30%),linear-gradient(180deg,_#07101e_0%,_#020617_100%)] text-slate-100">
      <div className="relative mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <TopNav active="home" />

        <main className="relative isolate overflow-hidden pt-10">
          <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle,_rgba(248,209,99,0.18),_transparent_35%)] blur-3xl" />
          <div className="absolute left-1/2 top-20 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />

          <section className="mx-auto max-w-7xl pb-16 pt-16">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200 shadow-sm shadow-amber-500/10">
                  Nuevo diseño
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs uppercase tracking-[0.24em] text-amber-100">Moderno</span>
                </div>
                <div className="space-y-6">
                  <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Controla tu distribuidora de huevos con una experiencia más rápida, clara y atractiva.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                    OvoGest ofrece una interfaz pensada para mayoristas: inventario, pedidos, entregas y reportes en un panel intuitivo con animaciones suaves.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:from-amber-600 hover:to-amber-700"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/setup"
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-slate-100 transition hover:bg-white/10"
                  >
                    Ver setup
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="glass-card relative overflow-hidden rounded-[2rem] border border-white/10 p-8 shadow-2xl shadow-slate-950/20">
                  <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl" />
                  <div className="relative z-10 space-y-6">
                    <div className="rounded-[1.7rem] bg-slate-950/85 p-6 border border-white/10 shadow-lg shadow-slate-950/20">
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Visión rápida</p>
                      <p className="mt-3 text-slate-200">
                        Un escritorio centralizado para revisar ventas, controlar existencias y coordinar entregas en un solo lugar.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-5 shadow-md shadow-slate-950/10">
                        <p className="text-3xl">📦</p>
                        <p className="mt-4 font-semibold text-white">Inventario</p>
                        <p className="mt-2 text-sm text-slate-400">Stock al instante y alertas automáticas.</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-5 shadow-md shadow-slate-950/10">
                        <p className="text-3xl">📋</p>
                        <p className="mt-4 font-semibold text-white">Pedidos</p>
                        <p className="mt-2 text-sm text-slate-400">Flujo claro para cada pedido de tus clientes.</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-5 shadow-md shadow-slate-950/10">
                        <p className="text-3xl">🚚</p>
                        <p className="mt-4 font-semibold text-white">Entregas</p>
                        <p className="mt-2 text-sm text-slate-400">Rutas y entregas más fáciles de coordinar.</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-5 shadow-md shadow-slate-950/10">
                        <p className="text-3xl">📊</p>
                        <p className="mt-4 font-semibold text-white">Reportes</p>
                        <p className="mt-2 text-sm text-slate-400">Análisis visual para decisiones rápidas.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl space-y-10 py-10">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:bg-slate-900/95">
                <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Moderniza</p>
                <h2 className="mt-4 text-2xl font-semibold text-white">Interfaz limpia</h2>
                <p className="mt-3 text-slate-300">Controles claros, textos legibles y un dashboard que facilita decisiones.</p>
              </div>
              <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:bg-slate-900/95">
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Acelera</p>
                <h2 className="mt-4 text-2xl font-semibold text-white">Flujo ágil</h2>
                <p className="mt-3 text-slate-300">Navega rápido entre módulos sin perder contexto ni tiempo.</p>
              </div>
              <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:bg-slate-900/95">
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Visualiza</p>
                <h2 className="mt-4 text-2xl font-semibold text-white">Datos claros</h2>
                <p className="mt-3 text-slate-300">Reportes y métricas listos para revisar en segundos.</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
