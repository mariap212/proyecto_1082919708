'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, formatCurrency, formatDateTime } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Client, Order, OrderStatus } from '@/lib/types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: 'bg-amber-500/15 text-amber-300',
  aprobado: 'bg-emerald-500/15 text-emerald-300',
  cancelado: 'bg-rose-500/15 text-rose-300',
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [status, setStatus] = useState<OrderStatus | ''>('');

  useEffect(() => {
    const q = status ? `?status=${status}` : '';
    apiGet<Order[]>(`/api/orders${q}`).then(setOrders).catch(() => undefined);
    apiGet<Client[]>('/api/clients?all=true').then((cs) =>
      setClients(Object.fromEntries(cs.map((c) => [c.id, c])))
    ).catch(() => undefined);
  }, [status]);

  return (
    <>
      <PageHeader
        title="Pedidos"
        subtitle="Gestión de órdenes de venta"
        actions={<Link href="/pedidos/nuevo" className="btn-primary">+ Nuevo pedido</Link>}
      />

      <div className="mb-4 flex gap-2 items-center">
        <span className="text-xs text-slate-400">Filtrar:</span>
        {(['', 'pendiente', 'aprobado', 'cancelado'] as const).map((s) => (
          <button
            key={s || 'todos'}
            onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded-full text-xs ${
              status === s ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/40' : 'bg-white/5 text-slate-400'
            }`}
          >
            {s || 'todos'}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/5 bg-slate-950/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-slate-400 text-xs">{formatDateTime(o.created_at)}</td>
                <td className="px-4 py-3 text-slate-200">{clients[o.client_id]?.name ?? o.client_id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-right text-slate-100 font-medium">{formatCurrency(Number(o.total))}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/pedidos/${o.id}`} className="text-amber-300 text-xs hover:underline">Ver →</Link>
                </td>
              </tr>
            ))}
            {!orders.length && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Sin pedidos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .btn-primary { padding:.6rem 1rem; border-radius:.5rem; background:linear-gradient(to right,#f59e0b,#d97706); color:#fff; font-weight:600; font-size:.875rem; display:inline-block; }
      `}</style>
    </>
  );
}
