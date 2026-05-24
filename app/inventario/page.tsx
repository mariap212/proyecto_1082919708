import type { Metadata } from 'next';
import React from 'react';
import TopNav from '@/components/layout/TopNav';

export const metadata: Metadata = {
  title: 'Inventario | OvoGest',
  description: 'Gestión de inventario de OvoGest',
};

export default function InventarioPage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.14),_transparent_24%),linear-gradient(180deg,_#08101c_0%,_#020617_100%)] text-slate-100 px-4 py-12">
      <div className="relative mx-auto w-full max-w-6xl">
        <TopNav />
        <section className="glass-card relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/30">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-amber-300 font-semibold">Inventario</p>
              <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Controla tu stock</h1>
              <p className="mt-4 text-slate-300 max-w-3xl leading-7">
                Esta sección mostrará el inventario disponible, el stock por producto y las alertas de baja existencia.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Estado actual</p>
                <p className="mt-4 text-white font-semibold">Inventario en construcción</p>
                <p className="mt-3 text-slate-400">Pronto podrás revisar stock, entradas y salidas de productos desde aquí.</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Próximos pasos</p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-300">
                  <li>Ver stock por lote</li>
                  <li>Recibir nuevos productos</li>
                  <li>Alertas de inventario bajo</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
