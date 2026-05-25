'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, buildQuery, formatCurrency, formatDateTime, type Paginated } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Eyebrow,
  Panel,
  SkeletonTable,
  StatusDot,
  EmptyState,
} from '@/components/ui/primitives';
import { SearchBar, DateRangePicker, Pagination } from '@/components/ui/filters';
import type { Client, Order, OrderStatus } from '@/lib/types';

const STATUS_COLOR: Record<OrderStatus, 'amber' | 'emerald' | 'rose'> = {
  pendiente: 'amber',
  aprobado: 'emerald',
  cancelado: 'rose',
};

const FILTERS: Array<{ id: OrderStatus | ''; label: string }> = [
  { id: '', label: 'Todos' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'aprobado', label: 'Aprobados' },
  { id: 'cancelado', label: 'Cancelados' },
];

const PAGE_SIZE = 25;

export default function PedidosPage() {
  const [data, setData] = useState<Paginated<Order> | null>(null);
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [q, setQ] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setData(null);
    const qs = buildQuery({
      status: status || undefined,
      q: q || undefined,
      from: range.from ? new Date(range.from).toISOString() : undefined,
      to: range.to ? new Date(range.to + 'T23:59:59').toISOString() : undefined,
      limit: PAGE_SIZE,
      offset,
    });
    apiGet<Paginated<Order>>(`/api/orders${qs}`)
      .then(setData)
      .catch(() => setData({ items: [], total: 0, limit: PAGE_SIZE, offset }));
  }, [status, q, range, offset]);

  useEffect(() => {
    apiGet<Client[]>('/api/clients?all=true')
      .then((cs) => setClients(Object.fromEntries(cs.map((c) => [c.id, c]))))
      .catch(() => undefined);
  }, []);

  // Reset offset al cambiar filtros
  useEffect(() => {
    setOffset(0);
  }, [status, q, range]);

  return (
    <>
      <PageHeader
        eyebrow="Comercial · Órdenes de venta"
        title="Pedidos"
        subtitle="Crea, revisa y aprueba pedidos. La aprobación dispara la cadena stock → factura → entrega."
        actions={
          <Link href="/pedidos/nuevo" className="btn btn-primary">
            + Nuevo pedido
          </Link>
        }
      />

      {/* Filter bar */}
      <div className="mb-6 panel !p-4 flex flex-wrap items-center gap-4">
        <SearchBar value={q} onChange={setQ} placeholder="Buscar por cliente o NIT…" />
        <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
      </div>

      {/* Status chips */}
      <div className="mb-6 flex items-center gap-2">
        <Eyebrow>Estado</Eyebrow>
        <div className="flex gap-1">
          {FILTERS.map((f) => {
            const active = status === f.id;
            return (
              <button
                key={f.id || 'all'}
                onClick={() => setStatus(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  active
                    ? 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {data === null ? (
        <SkeletonTable rows={6} cols={5} />
      ) : data.items.length === 0 ? (
        <EmptyState
          glyph="∅"
          title={q || status || range.from ? 'Sin coincidencias' : 'Sin pedidos registrados'}
          description={
            q || status || range.from
              ? 'Ajusta los filtros para ampliar la búsqueda.'
              : 'Crea el primer pedido para comenzar el flujo comercial.'
          }
          action={
            !q && !status && !range.from ? (
              <Link href="/pedidos/nuevo" className="btn btn-primary">
                + Nuevo pedido
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <Panel padded={false}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th className="text-right">Total</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((o) => (
                  <tr key={o.id}>
                    <td className="text-xs text-slate-500 tabular-nums">{formatDateTime(o.created_at)}</td>
                    <td>
                      <div className="text-slate-100">
                        {clients[o.client_id]?.name ?? (
                          <span className="mono text-slate-500">{o.client_id.slice(0, 8)}</span>
                        )}
                      </div>
                      {clients[o.client_id]?.nit && (
                        <div className="mono text-[0.65rem] text-slate-600 mt-0.5">
                          NIT {clients[o.client_id].nit}
                        </div>
                      )}
                    </td>
                    <td className="text-right">
                      <span className="num-hero text-base not-italic text-white tabular-nums">
                        {formatCurrency(Number(o.total))}
                      </span>
                    </td>
                    <td>
                      <StatusDot
                        color={STATUS_COLOR[o.status]}
                        label={o.status}
                        pulse={o.status === 'pendiente'}
                      />
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/pedidos/${o.id}`}
                        className="text-amber-300 text-xs hover:text-amber-200 transition-colors"
                      >
                        Ver detalle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <Pagination
            total={data.total}
            limit={data.limit}
            offset={data.offset}
            onChange={setOffset}
            label="pedidos"
          />
        </>
      )}
    </>
  );
}
