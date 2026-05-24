import type { Metadata } from 'next';
import React from 'react';
import TopNav from '@/components/layout/TopNav';

export const metadata: Metadata = {
  title: 'Pedidos | OvoGest',
  description: 'Gestión de pedidos de OvoGest',
};

export default function PedidosPage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.14),_transparent_24%),linear-gradient(180deg,_#08101c_0%,_#020617_100%)] text-slate-100 px-4 py-12">
      <div className="relative mx-auto w-full max-w-6xl">
        <TopNav />
        <section className="glass-card relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/30">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300 font-semibold">Pedidos</p>
              <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Administra tus órdenes</h1>
              <p className="mt-4 text-slate-300 max-w-3xl leading-7">
                Aquí podrás crear nuevos pedidos, revisar pedidos pendientes y actualizar el estado de cada orden.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Estado actual</p>
                <p className="mt-4 text-white font-semibold">Pedidos en construcción</p>
                <p className="mt-3 text-slate-400">Próximamente podrás revisar pedidos activos y su seguimiento desde aquí.</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Próximos pasos</p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-300">
                  <li>Revisar pedidos por cliente</li>
                  <li>Actualizar el estado de entrega</li>
                  <li>Generar facturas</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
