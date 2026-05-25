'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Eyebrow,
  HeroNumber,
  SkeletonStat,
  SkeletonTable,
  StatusDot,
  Panel,
} from '@/components/ui/primitives';
import type { StockView } from '@/lib/types';

interface SalesReport {
  totals: { orders: number; approved_orders: number; revenue: number; invoices: number };
}
interface InventoryReport {
  totals: { units: number; valuation: number; low_count: number };
}

export default function DashboardPage() {
  const [stock, setStock] = useState<StockView[] | null>(null);
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [inv, setInv] = useState<InventoryReport | null>(null);

  useEffect(() => {
    apiGet<StockView[]>('/api/inventory').then(setStock).catch(() => setStock([]));
    apiGet<SalesReport>('/api/reports/sales').then(setSales).catch(() => undefined);
    apiGet<InventoryReport>('/api/reports/inventory').then(setInv).catch(() => undefined);
  }, []);

  const alerts = stock?.filter((s) => s.is_low) ?? [];
  const now = new Date();
  const dateLabel = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <PageHeader
        eyebrow={`Edición · ${dateLabel}`}
        title="Resumen operativo"
        subtitle="Estado actual del inventario, ventas del periodo y alertas activas en una sola vista."
        actions={
          <Link href="/pedidos/nuevo" className="btn btn-primary">
            <span>+ Nuevo pedido</span>
          </Link>
        }
      />

      {/* KPI grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12 animate-rise [animation-delay:80ms]">
        {inv === null ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <KpiCard
              eyebrow="Unidades en stock"
              value={<HeroNumber value={inv.totals.units.toLocaleString('es-CO')} />}
              detail={`${inv.totals.low_count} tipos en alerta`}
              flag={inv.totals.low_count > 0 ? 'amber' : 'emerald'}
            />
            <KpiCard
              eyebrow="Valoración inventario"
              value={
                <HeroNumber
                  prefix="$"
                  value={
                    new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(
                      inv.totals.valuation
                    )
                  }
                />
              }
              detail="COP a precio de venta"
              accent
            />
          </>
        )}

        {sales === null ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <KpiCard
              eyebrow="Pedidos aprobados · 30d"
              value={<HeroNumber value={sales.totals.approved_orders} />}
              detail={`de ${sales.totals.orders} pedidos totales`}
            />
            <KpiCard
              eyebrow="Ingresos · 30d"
              value={
                <HeroNumber
                  prefix="$"
                  value={
                    new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(
                      sales.totals.revenue
                    )
                  }
                />
              }
              detail={`${sales.totals.invoices} facturas emitidas`}
              accent
            />
          </>
        )}
      </section>

      {/* Stock + Alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-rise [animation-delay:160ms]">
        {/* Stock table */}
        <div className="lg:col-span-2">
          <div className="flex items-end justify-between mb-4">
            <div>
              <Eyebrow>Inventario activo</Eyebrow>
              <h2 className="heading-serif text-xl text-slate-100 mt-1">Stock por tipo</h2>
            </div>
            <Link
              href="/inventario"
              className="text-xs text-amber-300 hover:text-amber-200 transition-colors"
            >
              Ver detalle →
            </Link>
          </div>
          {stock === null ? (
            <SkeletonTable rows={4} cols={3} />
          ) : (
            <Panel padded={false}>
              <div className="divide-y divide-white/[0.04]">
                {stock.map((s, i) => {
                  const ratio = s.current_stock / Math.max(s.min_stock, 1);
                  const pct = Math.min(100, ratio * 50);
                  return (
                    <div
                      key={s.egg_type_id}
                      className="px-6 py-4 group hover:bg-white/[0.015] transition-colors animate-rise"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-baseline gap-3">
                          <span className="mono text-xs text-amber-300/80 w-7">{s.code}</span>
                          <span className="text-sm text-slate-200">{s.name}</span>
                        </div>
                        <div className="flex items-baseline gap-3">
                          <span className="num-hero text-lg text-white">
                            {s.current_stock.toLocaleString('es-CO')}
                          </span>
                          <span className="text-[0.6rem] text-slate-500 mono">UND</span>
                        </div>
                      </div>
                      <div className="relative h-1 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                            s.is_low
                              ? 'bg-gradient-to-r from-rose-500/80 to-rose-400/60'
                              : 'bg-gradient-to-r from-amber-500/90 to-amber-300/80'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                        {/* Minimum marker */}
                        <div className="absolute inset-y-0 w-px bg-white/30" style={{ left: '50%' }} />
                      </div>
                      <div className="mt-1.5 flex justify-between text-[0.65rem] text-slate-500">
                        <span>Mín: {s.min_stock}</span>
                        <span>{s.is_low ? 'BAJO MÍNIMO' : 'En operación'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}
        </div>

        {/* Alerts ticker */}
        <div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <Eyebrow>Avisos</Eyebrow>
              <h2 className="heading-serif text-xl text-slate-100 mt-1">Alertas</h2>
            </div>
            <span className="text-xs text-slate-500 mono tabular-nums">{alerts.length} activas</span>
          </div>

          {stock === null ? (
            <Panel className="space-y-3 !p-5">
              <SkeletonTable rows={3} cols={1} />
            </Panel>
          ) : alerts.length === 0 ? (
            <Panel className="!p-6">
              <div className="text-center py-6">
                <div className="num-hero text-3xl text-emerald-400/60 mb-2">✓</div>
                <p className="text-sm text-slate-300">Sin alertas activas</p>
                <p className="text-xs text-slate-500 mt-1">
                  Todos los tipos están sobre el mínimo configurado.
                </p>
              </div>
            </Panel>
          ) : (
            <ul className="space-y-3">
              {alerts.map((a, i) => (
                <li
                  key={a.egg_type_id}
                  className="panel !p-5 group hover:border-rose-500/30 transition-all animate-rise"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <StatusDot color="rose" label="STOCK BAJO" pulse />
                    <span className="mono text-[0.6rem] text-slate-500">{a.code}</span>
                  </div>
                  <div className="heading-serif text-base text-slate-100 mb-1">{a.name}</div>
                  <div className="flex items-baseline gap-2 text-xs text-slate-400">
                    <span className="num-hero text-lg text-rose-300 not-italic">
                      {a.current_stock}
                    </span>
                    <span>de mínimo {a.min_stock}</span>
                  </div>
                  <Link
                    href="/inventario"
                    className="mt-3 inline-flex text-xs text-amber-300 hover:text-amber-200"
                  >
                    Registrar entrada →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function KpiCard({
  eyebrow,
  value,
  detail,
  accent = false,
  flag,
}: {
  eyebrow: string;
  value: React.ReactNode;
  detail?: string;
  accent?: boolean;
  flag?: 'amber' | 'emerald';
}) {
  return (
    <Panel padded={false} accent={accent}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Eyebrow>{eyebrow}</Eyebrow>
          {flag === 'amber' && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-dot mt-0.5" />
          )}
          {flag === 'emerald' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </div>
        <div>{value}</div>
        {detail && (
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <div className="text-xs text-slate-500">{detail}</div>
          </div>
        )}
      </div>
    </Panel>
  );
}
