import type { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
  title: 'Setup | OvoGest',
  description: 'Página informativa de setup para el proyecto OvoGest',
};

export default function SetupPage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white/95 p-10 shadow-xl shadow-slate-300/20 backdrop-blur-xl">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-amber-700 font-semibold">OvoGest</p>
            <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">Página de Setup</h1>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Esta ruta existe ahora para evitar el error 404, pero no ejecuta ningún script de instalación.
            </p>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-slate-800 font-medium">Qué significa esta página</p>
            <ul className="list-inside list-disc space-y-2 text-slate-600">
              <li>El comando <code className="rounded-md bg-slate-100 px-1.5 py-0.5">npm run setup</code> se ejecuta en tu máquina.</li>
              <li>En producción, <code className="rounded-md bg-slate-100 px-1.5 py-0.5">/setup</code> no es un endpoint de instalación.</li>
              <li>Para usar la aplicación, visita <code className="rounded-md bg-slate-100 px-1.5 py-0.5">/</code> o <code className="rounded-md bg-slate-100 px-1.5 py-0.5">/login</code>.</li>
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-amber-700"
            >
              Ir a Login
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Ir a Inicio
            </Link>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 text-slate-700">
            <p className="font-medium text-slate-900">Consejo</p>
            <p className="mt-2 text-sm leading-6">
              Si necesitas instalar dependencias o revisar el proyecto en tu máquina, abre la terminal en la carpeta del proyecto y ejecuta <code className="rounded-md bg-slate-100 px-1.5 py-0.5">npm install</code>, seguido de <code className="rounded-md bg-slate-100 px-1.5 py-0.5">npm run dev</code>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
