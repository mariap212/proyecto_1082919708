'use client';

import { useEffect, useState } from 'react';
import {
  apiGet,
  apiPost,
  buildQuery,
  formatCurrency,
  formatDateTime,
  type Paginated,
} from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Panel,
  SkeletonTable,
  StatusDot,
  EmptyState,
} from '@/components/ui/primitives';
import { SearchBar, DateRangePicker, Pagination } from '@/components/ui/filters';
import type { Invoice } from '@/lib/types';

const PAGE_SIZE = 25;

export default function FacturasPage() {
  const [data, setData] = useState<Paginated<Invoice> | null>(null);
  const [includeVoided, setIncludeVoided] = useState(true);
  const [q, setQ] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [offset, setOffset] = useState(0);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setData(null);
    const qs = buildQuery({
      include_voided: includeVoided,
      q: q || undefined,
      from: range.from ? new Date(range.from).toISOString() : undefined,
      to: range.to ? new Date(range.to + 'T23:59:59').toISOString() : undefined,
      limit: PAGE_SIZE,
      offset,
    });
    apiGet<Paginated<Invoice>>(`/api/invoices${qs}`)
      .then(setData)
      .catch(() => setData({ items: [], total: 0, limit: PAGE_SIZE, offset }));
  }, [includeVoided, q, range, offset, refresh]);

  useEffect(() => {
    setOffset(0);
  }, [includeVoided, q, range]);

  async function voidIt(id: string, number: number) {
    const reason = prompt(`Motivo para anular la factura #${String(number).padStart(4, '0')} (mín. 5 caracteres):`);
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
      <PageHeader
        eyebrow="Comercial · Documentos"
        title="Facturas emitidas"
        subtitle="Numeración consecutiva (RN-10). Las facturas no se eliminan, solo se anulan con motivo (RN-07)."
      />

      <div className="mb-6 panel !p-4 flex flex-wrap items-center gap-4">
        <SearchBar value={q} onChange={setQ} placeholder="Buscar por número…" />
        <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
        <label className="ml-auto flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeVoided}
            onChange={(e) => setIncludeVoided(e.target.checked)}
            className="accent-amber-500"
          />
          Incluir anuladas
        </label>
      </div>

      {data === null ? (
        <SkeletonTable rows={6} cols={5} />
      ) : data.items.length === 0 ? (
        <EmptyState
          glyph="—"
          title={q || range.from ? 'Sin coincidencias' : 'Sin facturas emitidas'}
          description={
            q || range.from
              ? 'Ajusta los filtros para ampliar la búsqueda.'
              : 'Las facturas se generan automáticamente al aprobar pedidos.'
          }
        />
      ) : (
        <>
          <Panel padded={false}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Fecha</th>
                  <th>Pedido</th>
                  <th className="text-right">Total</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <span className="num-hero text-lg not-italic text-amber-200 tabular-nums">
                        #{String(inv.invoice_number).padStart(4, '0')}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500 tabular-nums">{formatDateTime(inv.created_at)}</td>
                    <td className="mono text-xs text-slate-400">{inv.order_id.slice(0, 8)}</td>
                    <td className="text-right">
                      <span
                        className={`num-hero text-base not-italic tabular-nums ${
                          inv.is_voided ? 'text-slate-500 line-through' : 'text-white'
                        }`}
                      >
                        {formatCurrency(Number(inv.total))}
                      </span>
                    </td>
                    <td>
                      {inv.is_voided ? (
                        <div>
                          <StatusDot color="rose" label="anulada" />
                          {inv.void_reason && (
                            <div className="text-[0.65rem] text-rose-400/80 mt-1 max-w-xs truncate">
                              {inv.void_reason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <StatusDot color="emerald" label="vigente" />
                      )}
                    </td>
                    <td className="text-right">
                      {!inv.is_voided && (
                        <button
                          onClick={() => voidIt(inv.id, inv.invoice_number)}
                          className="text-rose-300 text-xs hover:text-rose-200 transition-colors"
                        >
                          Anular →
                        </button>
                      )}
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
            label="facturas"
          />
        </>
      )}
    </>
  );
}
