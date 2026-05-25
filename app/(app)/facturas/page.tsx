'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost, formatCurrency, formatDateTime } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Invoice } from '@/lib/types';

export default function FacturasPage() {
  const [invs, setInvs] = useState<Invoice[]>([]);
  const [includeVoided, setIncludeVoided] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    apiGet<Invoice[]>(`/api/invoices?include_voided=${includeVoided}`).then(setInvs).catch(() => undefined);
  }, [includeVoided, refresh]);

  async function voidIt(id: string) {
    const reason = prompt('Motivo de la anulación (mín 5 chars):');
    if (!reason || reason.length < 5) return;
    try {
      await apiPost(`/api/invoices/${id}/void`, { reason });
      setRefresh((r) => r + 1);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <>
      <PageHeader title="Facturas" subtitle="Históricamente consecutivas, anulables (RN-07/10)" />

      <label className="flex items-center gap-2 text-sm text-slate-300 mb-4">
        <input type="checkbox" checked={includeVoided} onChange={(e) => setIncludeVoided(e.target.checked)} />
        Incluir anuladas
      </label>

      <div className="rounded-xl border border-white/5 bg-slate-950/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">N°</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Pedido</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {invs.map((inv) => (
              <tr key={inv.id}>
                <td className="px-4 py-3 font-mono text-amber-300">#{inv.invoice_number}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(inv.created_at)}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{inv.order_id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-right text-slate-100">{formatCurrency(Number(inv.total))}</td>
                <td className="px-4 py-3 text-center">
                  {inv.is_voided ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 text-xs">Anulada</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs">Válida</span>
                  )}
                  {inv.void_reason && <div className="text-xs text-rose-400 mt-1">{inv.void_reason}</div>}
                </td>
                <td className="px-4 py-3 text-right">
                  {!inv.is_voided && (
                    <button onClick={() => voidIt(inv.id)} className="text-rose-300 text-xs hover:underline">Anular</button>
                  )}
                </td>
              </tr>
            ))}
            {!invs.length && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Sin facturas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
