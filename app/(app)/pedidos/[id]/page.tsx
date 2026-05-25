'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { apiGet, apiPost, formatCurrency, formatDateTime } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Eyebrow,
  HeroNumber,
  Panel,
  StatusDot,
  Button,
  Skeleton,
} from '@/components/ui/primitives';
import type { OrderWithItems, EggType, OrderStatus } from '@/lib/types';

interface DetailMissing {
  missing?: Array<{ code?: string; needed: number; available: number }>;
}

const STATUS_COLOR: Record<OrderStatus, 'amber' | 'emerald' | 'rose'> = {
  pendiente: 'amber',
  aprobado: 'emerald',
  cancelado: 'rose',
};

export default function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [eggs, setEggs] = useState<Record<string, EggType>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string; missing?: DetailMissing['missing'] } | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    apiGet<OrderWithItems>(`/api/orders/${id}`)
      .then(setOrder)
      .catch((e: Error) => setMsg({ tone: 'err', text: e.message }));
    apiGet<EggType[]>('/api/egg-types?all=true').then((es) =>
      setEggs(Object.fromEntries(es.map((e) => [e.id, e])))
    );
  }, [id, refresh]);

  async function approve() {
    if (!confirm('Aprobar este pedido descuenta stock, genera factura y crea la entrega. ¿Continuar?'))
      return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await apiPost<{ invoice_number: number; delivery_id: string }>(
        `/api/orders/${id}/approve`
      );
      setMsg({ tone: 'ok', text: `Pedido aprobado. Factura #${String(r.invoice_number).padStart(4, '0')} generada.` });
      setRefresh((r) => r + 1);
    } catch (e) {
      const err = e as Error & { detail?: DetailMissing };
      setMsg({ tone: 'err', text: err.message, missing: err.detail?.missing });
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!confirm('¿Cancelar este pedido? Solo se puede cancelar mientras esté en estado pendiente.'))
      return;
    setBusy(true);
    setMsg(null);
    try {
      await apiPost(`/api/orders/${id}/cancel`);
      setMsg({ tone: 'ok', text: 'Pedido cancelado' });
      setRefresh((r) => r + 1);
    } catch (e) {
      setMsg({ tone: 'err', text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  if (!order) {
    return (
      <>
        <PageHeader eyebrow="Comercial" title="Cargando pedido…" subtitle="Recuperando información del pedido y sus ítems." />
        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          <Skeleton height="22rem" />
          <Skeleton height="22rem" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`Comercial · Pedido ${id.slice(0, 8)}`}
        title={`Pedido N° ${id.slice(0, 8)}`}
        subtitle={`Creado el ${formatDateTime(order.created_at)}`}
        actions={
          order.status === 'pendiente' ? (
            <>
              <Button variant="ghost" onClick={cancel} disabled={busy}>
                Cancelar pedido
              </Button>
              <Button onClick={approve} disabled={busy}>
                {busy ? 'Procesando…' : 'Aprobar pedido'}
              </Button>
            </>
          ) : (
            <Link href="/pedidos" className="btn btn-ghost">
              ← Volver al listado
            </Link>
          )
        }
      />

      {msg && (
        <div
          className={`panel !p-4 mb-6 animate-rise ${
            msg.tone === 'ok' ? 'border-emerald-500/20' : 'border-rose-500/20'
          }`}
        >
          <p className={`text-sm ${msg.tone === 'ok' ? 'text-emerald-300' : 'text-rose-300'}`}>
            {msg.tone === 'ok' ? '✓ ' : '✗ '}
            {msg.text}
          </p>
          {msg.missing && msg.missing.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-rose-300/80">
              {msg.missing.map((m, i) => (
                <li key={i}>
                  <span className="mono text-amber-300/70">{m.code}</span> · necesita {m.needed}, hay {m.available}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_350px] gap-8 animate-rise">
        {/* Invoice-like detail */}
        <Panel padded={false}>
          <div className="p-6 pb-4 border-b border-white/[0.05] flex items-start justify-between">
            <div>
              <Eyebrow>Detalle de ítems</Eyebrow>
              <div className="heading-serif text-2xl text-slate-100 mt-1">
                {order.items.length} {order.items.length === 1 ? 'ítem' : 'ítems'}
              </div>
            </div>
            <StatusDot
              color={STATUS_COLOR[order.status]}
              label={order.status}
              pulse={order.status === 'pendiente'}
            />
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-right">Cantidad</th>
                <th className="text-right">Precio/u</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id}>
                  <td>
                    <div className="text-slate-100">
                      {eggs[it.egg_type_id]?.name ?? (
                        <span className="mono text-slate-500">{it.egg_type_id.slice(0, 8)}</span>
                      )}
                    </div>
                    <div className="mono text-[0.65rem] text-amber-300/60 mt-0.5">
                      {eggs[it.egg_type_id]?.code}
                    </div>
                  </td>
                  <td className="text-right tabular-nums text-slate-200">
                    {it.quantity.toLocaleString('es-CO')}
                  </td>
                  <td className="text-right tabular-nums text-slate-400 text-sm">
                    {formatCurrency(Number(it.unit_price))}
                  </td>
                  <td className="text-right">
                    <span className="num-hero text-base not-italic text-white tabular-nums">
                      {formatCurrency(Number(it.subtotal))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-6 pt-4 flex items-end justify-between border-t border-white/[0.05]">
            <div className="space-y-1">
              <Eyebrow>Total del pedido</Eyebrow>
              <div className="text-xs text-slate-600 mono">Cifras en COP</div>
            </div>
            <HeroNumber
              prefix="$"
              value={new Intl.NumberFormat('es-CO').format(Number(order.total))}
              size="xl"
              className="text-amber-200"
            />
          </div>
        </Panel>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Panel>
            <Eyebrow>Cliente</Eyebrow>
            <div className="mt-2 heading-serif text-lg text-slate-100">
              {order.client?.name ?? '—'}
            </div>
            <div className="mono text-xs text-slate-500 mt-1">NIT {order.client?.nit ?? '—'}</div>
          </Panel>

          <Panel>
            <Eyebrow>Estado</Eyebrow>
            <div className="mt-2 mb-3">
              <StatusDot
                color={STATUS_COLOR[order.status]}
                label={order.status}
                pulse={order.status === 'pendiente'}
              />
            </div>
            {order.approved_at && (
              <div className="pt-3 border-t border-white/[0.05] text-xs text-slate-500">
                Aprobado el {formatDateTime(order.approved_at)}
              </div>
            )}
          </Panel>

          {order.notes && (
            <Panel>
              <Eyebrow>Notas</Eyebrow>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">{order.notes}</p>
            </Panel>
          )}
        </aside>
      </div>
    </>
  );
}
