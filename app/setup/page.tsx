import type { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';
import TopNav from '@/components/layout/TopNav';

export const metadata: Metadata = {
  title: 'Setup | OvoGest',
  description: 'Página informativa de setup para el proyecto OvoGest',
};

export default function SetupPage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.14),_transparent_24%),linear-gradient(180deg,_#08101c_0%,_#020617_100%)] text-slate-100 px-4 py-16">
      <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
        <TopNav active="setup" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(248,209,99,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.08),_transparent_28%)] pointer-events-none" />
        <div className="relative space-y-8">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-300 font-semibold">OvoGest</p>
            <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Página de Setup</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Esta ruta sólo es informativa para el proyecto. En producción no ejecuta ningún script de instalación.
            </p>
          </div>

          <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-7 shadow-lg shadow-slate-950/20">
            <p className="text-slate-100 font-medium">Qué significa esta página</p>
            <ul className="list-inside list-disc space-y-3 text-slate-300">
              <li>El comando <code className="rounded-md bg-slate-800 px-1.5 py-0.5">npm run setup</code> se ejecuta localmente.</li>
              <li>En producción, <code className="rounded-md bg-slate-800 px-1.5 py-0.5">/setup</code> no es un endpoint de instalación.</li>
              <li>Usa <code className="rounded-md bg-slate-800 px-1.5 py-0.5">/</code> o <code className="rounded-md bg-slate-800 px-1.5 py-0.5">/login</code> para acceder a la aplicación.</li>
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:scale-[1.01]"
            >
              Ir a Login
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-3xl border border-white/10 bg-slate-800/80 px-6 py-3 text-base font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              Ir a Inicio
            </Link>
          </div>

          <div className="rounded-[1.75rem] border border-amber-400/10 bg-amber-500/10 p-6 text-slate-200">
            <p className="font-semibold text-white">Consejo</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Abre la terminal en la carpeta del proyecto y ejecuta <code className="rounded-md bg-slate-800 px-1.5 py-0.5">npm install</code>, luego <code className="rounded-md bg-slate-800 px-1.5 py-0.5">npm run dev</code> para visualizar el proyecto localmente.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
