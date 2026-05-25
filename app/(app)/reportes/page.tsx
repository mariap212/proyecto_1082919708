'use client';

import { useEffect, useState } from 'react';
import { apiGet, formatCurrency, formatDate } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';

interface SalesReport {
  range: { from: string; to: string };
  totals: { orders: number; approved_orders: number; revenue: number; invoices: number; voided_invoices: number };
  by_egg_type: Array<{ egg_type_id: string; code: string; quantity: number; revenue: number }>;
  by_client: Array<{ client_id: string; name: string; nit: string; orders: number; revenue: number }>;
}

interface InventoryReport {
  generated_at: string;
  rows: Array<{
    egg_type_id: string;
    code: string;
    name: string;
    current_stock: number;
    min_stock: number;
    price_per_unit: number;
    valuation: number;
    is_low: boolean;
  }>;
  totals: { units: number; valuation: number; low_count: number };
}

export default function ReportesPage() {
  const [tab, setTab] = useState<'ventas' | 'inventario'>('ventas');
  return (
    <>
      <PageHeader title="Reportes" subtitle="Métricas operativas" />
      <div className="border-b border-white/5 mb-6 flex gap-1">
        {(['ventas', 'inventario'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-t-md ${
              tab === t ? 'bg-amber-500/10 text-amber-200 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'ventas' ? 'Ventas' : 'Inventario'}
          </button>
        ))}
      </div>
      {tab === 'ventas' ? <VentasReport /> : <InventarioReport />}
    </>
  );
}

function VentasReport() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [data, setData] = useState<SalesReport | null>(null);

  useEffect(() => {
    apiGet<SalesReport>(
      `/api/reports/sales?from=${new Date(from).toISOString()}&to=${new Date(to + 'T23:59:59').toISOString()}`
    ).then(setData).catch(() => undefined);
  }, [from, to]);

  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-end">
        <label className="text-sm">
          <span className="block text-xs text-slate-400 mb-1">Desde</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
        </label>
        <label className="text-sm">
          <span className="block text-xs text-slate-400 mb-1">Hasta</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
        </label>
      </div>

      {!data ? (
        <p className="text-slate-400 text-sm">Cargando…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Pedidos totales" value={data.totals.orders} />
            <Stat label="Pedidos aprobados" value={data.totals.approved_orders} />
            <Stat label="Ingresos" value={formatCurrency(data.totals.revenue)} accent />
            <Stat label="Facturas anuladas" value={data.totals.voided_invoices} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="Ventas por tipo de huevo">
              <table className="w-full text-sm">
                <thead><tr className="text-slate-400 text-xs uppercase"><th className="text-left py-2">Código</th><th className="text-right">Unidades</th><th className="text-right">Ingresos</th></tr></thead>
                <tbody>
                  {data.by_egg_type.map((r) => (
                    <tr key={r.egg_type_id} className="border-t border-white/5"><td className="py-2 font-mono text-amber-300">{r.code}</td><td className="py-2 text-right">{r.quantity.toLocaleString()}</td><td className="py-2 text-right text-slate-200">{formatCurrency(r.revenue)}</td></tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <Card title="Top clientes">
              <table className="w-full text-sm">
                <thead><tr className="text-slate-400 text-xs uppercase"><th className="text-left py-2">Cliente</th><th className="text-right">Pedidos</th><th className="text-right">Ingresos</th></tr></thead>
                <tbody>
                  {data.by_client.map((r) => (
                    <tr key={r.client_id} className="border-t border-white/5"><td className="py-2 text-slate-200">{r.name}</td><td className="py-2 text-right">{r.orders}</td><td className="py-2 text-right text-slate-200">{formatCurrency(r.revenue)}</td></tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </>
      )}
      <FormStyles />
    </div>
  );
}

function InventarioReport() {
  const [data, setData] = useState<InventoryReport | null>(null);
  useEffect(() => {
    apiGet<InventoryReport>('/api/reports/inventory').then(setData).catch(() => undefined);
  }, []);
  if (!data) return <p className="text-slate-400 text-sm">Cargando…</p>;
  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-500">Generado: {formatDate(data.generated_at)}</p>
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Total unidades" value={data.totals.units.toLocaleString()} />
        <Stat label="Valoración" value={formatCurrency(data.totals.valuation)} accent />
        <Stat label="Tipos en alerta" value={data.totals.low_count} />
      </div>
      <Card title="Stock detallado">
        <table className="w-full text-sm">
          <thead><tr className="text-slate-400 text-xs uppercase"><th className="text-left py-2">Código</th><th className="text-left">Producto</th><th className="text-right">Stock</th><th className="text-right">Mín.</th><th className="text-right">Valoración</th><th className="text-center">Estado</th></tr></thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.egg_type_id} className="border-t border-white/5">
                <td className="py-2 font-mono text-amber-300">{r.code}</td>
                <td className="py-2 text-slate-200">{r.name}</td>
                <td className="py-2 text-right">{r.current_stock.toLocaleString()}</td>
                <td className="py-2 text-right text-slate-400">{r.min_stock}</td>
                <td className="py-2 text-right text-slate-200">{formatCurrency(r.valuation)}</td>
                <td className="py-2 text-center">{r.is_low ? '⚠' : '✓'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4">
      <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${accent ? 'text-amber-300' : 'text-slate-100'}`}>{value}</div>
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/5 bg-slate-950/40 p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">{title}</h3>
      {children}
    </div>
  );
}
function FormStyles() {
  return <style>{`.input { padding:.5rem .75rem; border-radius:.5rem; background:rgba(2,6,23,.6); color:#e2e8f0; border:1px solid rgba(255,255,255,.08); font-size:.875rem; outline:none; } .input:focus{border-color:rgba(245,158,11,.5);}`}</style>;
}
