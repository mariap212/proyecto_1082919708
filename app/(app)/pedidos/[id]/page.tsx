'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, formatCurrency, formatDateTime } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import type { OrderWithItems, EggType } from '@/lib/types';

interface DetailMissing {
  missing?: Array<{ code?: string; needed: number; available: number }>;
}

export default function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [eggs, setEggs] = useState<Record<string, EggType>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    apiGet<OrderWithItems>(`/api/orders/${id}`).then(setOrder).catch((e: Error) => setMsg(e.message));
    apiGet<EggType[]>('/api/egg-types?all=true').then((es) => setEggs(Object.fromEntries(es.map((e) => [e.id, e]))));
  }, [id, refresh]);

  async function approve() {
    if (!confirm('Aprobar este pedido descuenta stock, genera factura y crea entrega. ¿Continuar?')) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await apiPost<{ invoice_number: number; delivery_id: string }>(`/api/orders/${id}/approve`);
      setMsg(`✓ Pedido aprobado. Factura #${r.invoice_number} generada.`);
      setRefresh((r) => r + 1);
    } catch (e) {
      const err = e as Error & { detail?: DetailMissing };
      if (err.detail?.missing) {
        const parts = err.detail.missing.map((m) => `${m.code}: necesita ${m.needed}, hay ${m.available}`).join(' · ');
        setMsg(`✗ Stock insuficiente — ${parts}`);
      } else {
        setMsg(`✗ ${err.message}`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!confirm('¿Cancelar este pedido? (solo posible en estado pendiente)')) return;
    setBusy(true);
    setMsg(null);
    try {
      await apiPost(`/api/orders/${id}/cancel`);
      setMsg('✓ Pedido cancelado');
      setRefresh((r) => r + 1);
    } catch (e) {
      setMsg(`✗ ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  if (!order) return <p className="text-slate-400">Cargando…</p>;

  return (
    <>
      <PageHeader
        title={`Pedido ${order.id.slice(0, 8)}`}
        subtitle={`Creado ${formatDateTime(order.created_at)}`}
        actions={
          order.status === 'pendiente' ? (
            <>
              <button onClick={cancel} disabled={busy} className="btn-secondary">Cancelar</button>
              <button onClick={approve} disabled={busy} className="btn-primary">Aprobar pedido</button>
            </>
          ) : (
            <button onClick={() => router.push('/pedidos')} className="btn-secondary">← Volver</button>
          )
        }
      />

      {msg && (
        <p className={`mb-4 text-sm ${msg.startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'}`}>{msg}</p>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-slate-950/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                <th className="px-4 py-3 text-right">Precio/u</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {order.items.map((it) => (
                <tr key={it.id}>
                  <td className="px-4 py-3 text-slate-200">{eggs[it.egg_type_id]?.name ?? it.egg_type_id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-right">{it.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{formatCurrency(Number(it.unit_price))}</td>
                  <td className="px-4 py-3 text-right text-slate-100 font-medium">{formatCurrency(Number(it.subtotal))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-slate-400">TOTAL</td>
                <td className="px-4 py-3 text-right text-lg text-amber-300 font-semibold">{formatCurrency(Number(order.total))}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 bg-slate-950/40 p-5">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Cliente</h3>
            <div className="text-slate-200">{order.client?.name ?? '—'}</div>
            <div className="text-xs text-slate-500 mt-1">NIT {order.client?.nit ?? '—'}</div>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-950/40 p-5">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Estado</h3>
            <div className="text-slate-100 capitalize">{order.status}</div>
            {order.approved_at && (
              <div className="text-xs text-slate-500 mt-1">Aprobado {formatDateTime(order.approved_at)}</div>
            )}
          </div>

          {order.notes && (
            <div className="rounded-xl border border-white/5 bg-slate-950/40 p-5">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Notas</h3>
              <div className="text-slate-300 text-sm">{order.notes}</div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .btn-primary { padding:.6rem 1rem; border-radius:.5rem; background:linear-gradient(to right,#f59e0b,#d97706); color:#fff; font-weight:600; font-size:.875rem; }
        .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
        .btn-secondary { padding:.6rem 1rem; border-radius:.5rem; background:rgba(255,255,255,.06); color:#cbd5e1; font-weight:500; font-size:.875rem; }
      `}</style>
    </>
  );
}
