'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, formatCurrency } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiGet<StockView[]>('/api/inventory'),
      apiGet<SalesReport>('/api/reports/sales').catch(() => null),
      apiGet<InventoryReport>('/api/reports/inventory').catch(() => null),
    ])
      .then(([s, sl, iv]) => {
        setStock(s);
        setSales(sl);
        setInv(iv);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const alerts = stock?.filter((s) => s.is_low) ?? [];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Resumen operativo en tiempo real" />

      {error ? <p className="text-rose-400 text-sm mb-4">Error: {error}</p> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi label="Unidades en stock" value={inv ? inv.totals.units.toLocaleString() : '—'} />
        <Kpi label="Valoración inventario" value={inv ? formatCurrency(inv.totals.valuation) : '—'} accent="amber" />
        <Kpi label="Pedidos aprobados (30d)" value={sales ? sales.totals.approved_orders.toString() : '—'} />
        <Kpi label="Ingresos (30d)" value={sales ? formatCurrency(sales.totals.revenue) : '—'} accent="emerald" />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-slate-950/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Stock por tipo</h2>
            <Link href="/inventario" className="text-xs text-amber-300 hover:underline">Ver detalle →</Link>
          </div>
          {!stock ? (
            <p className="text-slate-400 text-sm">Cargando…</p>
          ) : (
            <div className="space-y-3">
              {stock.map((s) => {
                const pct = Math.min(100, (s.current_stock / Math.max(s.min_stock, 1)) * 50);
                return (
                  <div key={s.egg_type_id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-200">
                        {s.name} <span className="text-slate-500">({s.code})</span>
                      </span>
                      <span className={s.is_low ? 'text-rose-400' : 'text-emerald-400'}>
                        {s.current_stock.toLocaleString()} u. {s.is_low ? '⚠' : ''}
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${s.is_low ? 'bg-rose-500' : 'bg-amber-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/40 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Alertas de stock</h2>
          {alerts.length === 0 ? (
            <p className="text-emerald-400 text-sm">✓ Sin alertas activas</p>
          ) : (
            <ul className="space-y-2">
              {alerts.map((a) => (
                <li key={a.egg_type_id} className="text-sm rounded-md bg-rose-500/10 border border-rose-500/30 p-3">
                  <div className="font-medium text-rose-200">{a.name}</div>
                  <div className="text-xs text-rose-300/80 mt-1">
                    Stock {a.current_stock} &lt; mínimo {a.min_stock}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: 'amber' | 'emerald' }) {
  const accentClass =
    accent === 'amber' ? 'text-amber-300' : accent === 'emerald' ? 'text-emerald-300' : 'text-slate-100';
  return (
    <div className="rounded-xl border border-white/5 bg-slate-950/40 p-5">
      <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${accentClass}`}>{value}</div>
    </div>
  );
}
