'use client';

import { useEffect, useState } from 'react';
import { apiGet, formatCurrency, formatDate } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Eyebrow,
  HeroNumber,
  Panel,
  SkeletonTable,
  Skeleton,
  StatusDot,
  EmptyState,
} from '@/components/ui/primitives';

interface SalesReport {
  range: { from: string; to: string };
  totals: {
    orders: number;
    approved_orders: number;
    revenue: number;
    invoices: number;
    voided_invoices: number;
  };
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

const TABS = [
  { id: 'ventas' as const, label: 'Ventas', eyebrow: '01' },
  { id: 'inventario' as const, label: 'Inventario', eyebrow: '02' },
];

export default function ReportesPage() {
  const [tab, setTab] = useState<'ventas' | 'inventario'>('ventas');

  return (
    <>
      <PageHeader
        eyebrow="Reportes · Edición operativa"
        title="Reportes"
        subtitle="Series de tiempo, valoración de inventario y rankings comerciales."
      />

      <nav className="mb-8 flex gap-8 border-b border-white/[0.06]" role="tablist">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`relative pb-4 flex items-baseline gap-2 transition-colors ${
                active ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span
                className={`mono text-[0.6rem] tabular-nums ${
                  active ? 'text-amber-400' : 'text-slate-600'
                }`}
              >
                {t.eyebrow}
              </span>
              <span className="text-sm font-medium">{t.label}</span>
              {active && <span className="absolute left-0 right-0 -bottom-px h-px bg-amber-400" />}
            </button>
          );
        })}
      </nav>

      <div className="animate-rise">
        {tab === 'ventas' ? <VentasReport /> : <InventarioReport />}
      </div>
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
    setData(null);
    apiGet<SalesReport>(
      `/api/reports/sales?from=${new Date(from).toISOString()}&to=${new Date(to + 'T23:59:59').toISOString()}`
    )
      .then(setData)
      .catch(() => undefined);
  }, [from, to]);

  return (
    <div className="space-y-8">
      {/* Date range pill */}
      <div className="panel !p-4 flex items-center gap-6">
        <Eyebrow>Rango</Eyebrow>
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400">
            <span className="block mb-1 eyebrow !text-[0.55rem]">Desde</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input !py-1.5 !px-3 text-xs tabular-nums"
            />
          </label>
          <span className="text-slate-600 mt-4">→</span>
          <label className="text-xs text-slate-400">
            <span className="block mb-1 eyebrow !text-[0.55rem]">Hasta</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input !py-1.5 !px-3 text-xs tabular-nums"
            />
          </label>
        </div>
      </div>

      {data === null ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton height="6rem" />
            <Skeleton height="6rem" />
            <Skeleton height="6rem" />
            <Skeleton height="6rem" />
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton height="14rem" />
            <Skeleton height="14rem" />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Pedidos totales" value={data.totals.orders} />
            <StatCard label="Pedidos aprobados" value={data.totals.approved_orders} />
            <StatCard
              label="Ingresos"
              value={
                <HeroNumber
                  prefix="$"
                  value={new Intl.NumberFormat('es-CO').format(data.totals.revenue)}
                  size="md"
                />
              }
              accent
            />
            <StatCard label="Facturas anuladas" value={data.totals.voided_invoices} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <RankingCard
              eyebrow="Ventas por producto"
              title="Ranking por tipo"
              rows={data.by_egg_type.map((r) => ({
                key: r.egg_type_id,
                left: <span className="mono text-amber-300/80">{r.code}</span>,
                center: `${r.quantity.toLocaleString('es-CO')} u.`,
                right: formatCurrency(r.revenue),
              }))}
            />
            <RankingCard
              eyebrow="Ventas por cliente"
              title="Top clientes"
              rows={data.by_client
                .sort((a, b) => b.revenue - a.revenue)
                .map((r) => ({
                  key: r.client_id,
                  left: <span className="text-slate-100">{r.name}</span>,
                  center: `${r.orders} pedido${r.orders === 1 ? '' : 's'}`,
                  right: formatCurrency(r.revenue),
                }))}
            />
          </div>
        </>
      )}
    </div>
  );
}

function InventarioReport() {
  const [data, setData] = useState<InventoryReport | null>(null);
  useEffect(() => {
    apiGet<InventoryReport>('/api/reports/inventory').then(setData).catch(() => undefined);
  }, []);

  if (data === null) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Skeleton height="6rem" />
          <Skeleton height="6rem" />
          <Skeleton height="6rem" />
        </div>
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }

  if (data.rows.length === 0) {
    return <EmptyState glyph="∅" title="Sin productos en catálogo" />;
  }

  return (
    <div className="space-y-8">
      <p className="text-xs text-slate-500">
        Generado: <span className="tabular-nums">{formatDate(data.generated_at)}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total unidades"
          value={<HeroNumber value={data.totals.units.toLocaleString('es-CO')} size="md" />}
        />
        <StatCard
          label="Valoración total"
          accent
          value={
            <HeroNumber
              prefix="$"
              value={new Intl.NumberFormat('es-CO').format(data.totals.valuation)}
              size="md"
            />
          }
        />
        <StatCard
          label="Tipos en alerta"
          value={<HeroNumber value={data.totals.low_count} size="md" />}
        />
      </div>

      <Panel padded={false}>
        <div className="px-6 pt-5">
          <Eyebrow>Detalle</Eyebrow>
          <h3 className="heading-serif text-xl text-slate-100 mt-2">Stock por producto</h3>
        </div>
        <table className="data-table mt-3">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th className="text-right">Stock</th>
              <th className="text-right">Mínimo</th>
              <th className="text-right">Valoración</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.egg_type_id}>
                <td className="mono text-amber-300 text-sm">{r.code}</td>
                <td className="text-slate-100">{r.name}</td>
                <td className="text-right tabular-nums">
                  <span className="num-hero text-base not-italic text-white">
                    {r.current_stock.toLocaleString('es-CO')}
                  </span>
                </td>
                <td className="text-right tabular-nums text-slate-400">{r.min_stock}</td>
                <td className="text-right tabular-nums text-slate-200">
                  {formatCurrency(r.valuation)}
                </td>
                <td>
                  {r.is_low ? (
                    <StatusDot color="rose" label="bajo mínimo" pulse />
                  ) : (
                    <StatusDot color="emerald" label="ok" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Panel padded={false} accent={accent}>
      <div className="p-5">
        <Eyebrow>{label}</Eyebrow>
        <div className="mt-3">
          {typeof value === 'number' || typeof value === 'string' ? (
            <HeroNumber value={value} size="md" />
          ) : (
            value
          )}
        </div>
      </div>
    </Panel>
  );
}

function RankingCard({
  eyebrow,
  title,
  rows,
}: {
  eyebrow: string;
  title: string;
  rows: Array<{ key: string; left: React.ReactNode; center: string; right: string }>;
}) {
  return (
    <Panel>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3 className="heading-serif text-xl text-slate-100 mt-2 mb-4">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500 italic">Sin datos en el rango seleccionado.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r, i) => (
            <li
              key={r.key}
              className="flex items-center gap-4 pt-3 border-t border-white/[0.04] first:border-0 first:pt-0"
            >
              <span className="mono text-[0.65rem] text-slate-600 w-5 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 text-sm">{r.left}</span>
              <span className="text-xs text-slate-500 tabular-nums">{r.center}</span>
              <span className="num-hero text-sm not-italic text-white tabular-nums">{r.right}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
