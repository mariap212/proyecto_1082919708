'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, formatCurrency, formatDateTime } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Eyebrow,
  Panel,
  SkeletonTable,
  StatusDot,
  EmptyState,
} from '@/components/ui/primitives';
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

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [status, setStatus] = useState<OrderStatus | ''>('');

  useEffect(() => {
    const q = status ? `?status=${status}` : '';
    setOrders(null);
    apiGet<Order[]>(`/api/orders${q}`).then(setOrders).catch(() => setOrders([]));
    apiGet<Client[]>('/api/clients?all=true')
      .then((cs) => setClients(Object.fromEntries(cs.map((c) => [c.id, c]))))
      .catch(() => undefined);
  }, [status]);

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

      {/* Filter chips */}
      <div className="mb-6 flex items-center gap-2">
        <Eyebrow>Filtrar</Eyebrow>
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

      {orders === null ? (
        <SkeletonTable rows={6} cols={5} />
      ) : orders.length === 0 ? (
        <EmptyState
          glyph="∅"
          title={status ? `Sin pedidos en estado "${status}"` : 'Sin pedidos registrados'}
          description="Crea el primer pedido para comenzar el flujo comercial."
          action={
            <Link href="/pedidos/nuevo" className="btn btn-primary">
              + Nuevo pedido
            </Link>
          }
        />
      ) : (
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
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="text-xs text-slate-500 tabular-nums">{formatDateTime(o.created_at)}</td>
                  <td>
                    <div className="text-slate-100">
                      {clients[o.client_id]?.name ?? <span className="mono text-slate-500">{o.client_id.slice(0, 8)}</span>}
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
                    <StatusDot color={STATUS_COLOR[o.status]} label={o.status} pulse={o.status === 'pendiente'} />
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
      )}
    </>
  );
}
