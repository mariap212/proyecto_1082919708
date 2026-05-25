'use client';

import { useEffect, useState } from 'react';
import { apiGet, buildQuery, formatDateTime, type Paginated } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Eyebrow,
  Panel,
  SkeletonTable,
  EmptyState,
} from '@/components/ui/primitives';
import { SearchBar, DateRangePicker, Pagination } from '@/components/ui/filters';
import type { AuditAction, AuditLog, AuditResource } from '@/lib/types';

const PAGE_SIZE = 30;

const ACTION_LABEL: Record<AuditAction, string> = {
  'order.create': 'Pedido creado',
  'order.approve': 'Pedido aprobado',
  'order.cancel': 'Pedido cancelado',
  'invoice.void': 'Factura anulada',
  'inventory.entry': 'Entrada de stock',
  'inventory.adjust': 'Ajuste de stock',
  'inventory.return': 'Devolución de stock',
  'delivery.assign': 'Conductor asignado',
  'delivery.status': 'Estado de entrega',
  'user.create': 'Usuario creado',
  'user.update': 'Usuario actualizado',
  'egg_type.create': 'Producto creado',
  'egg_type.update': 'Producto actualizado',
  'supplier.create': 'Proveedor creado',
  'supplier.update': 'Proveedor actualizado',
  'supplier.deactivate': 'Proveedor desactivado',
  'client.create': 'Cliente creado',
  'client.update': 'Cliente actualizado',
  'client.deactivate': 'Cliente desactivado',
};

const ACTION_COLOR: Record<string, string> = {
  approve: 'text-emerald-300',
  create: 'text-sky-300',
  update: 'text-amber-300',
  cancel: 'text-rose-300',
  void: 'text-rose-300',
  deactivate: 'text-rose-300',
  entry: 'text-emerald-300',
  adjust: 'text-amber-300',
  return: 'text-sky-300',
  assign: 'text-violet-300',
  status: 'text-violet-300',
};

function actionColor(action: AuditAction): string {
  const last = action.split('.').pop() ?? '';
  return ACTION_COLOR[last] ?? 'text-slate-300';
}

const RESOURCE_FILTERS: Array<{ id: AuditResource | ''; label: string }> = [
  { id: '', label: 'Todo' },
  { id: 'order', label: 'Pedidos' },
  { id: 'invoice', label: 'Facturas' },
  { id: 'inventory', label: 'Inventario' },
  { id: 'delivery', label: 'Entregas' },
  { id: 'user', label: 'Usuarios' },
  { id: 'client', label: 'Clientes' },
  { id: 'supplier', label: 'Proveedores' },
  { id: 'egg_type', label: 'Productos' },
];

export default function AuditoriaPage() {
  const [data, setData] = useState<Paginated<AuditLog> | null>(null);
  const [q, setQ] = useState('');
  const [resource, setResource] = useState<AuditResource | ''>('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setData(null);
    const qs = buildQuery({
      q: q || undefined,
      resource_type: resource || undefined,
      from: range.from ? new Date(range.from).toISOString() : undefined,
      to: range.to ? new Date(range.to + 'T23:59:59').toISOString() : undefined,
      limit: PAGE_SIZE,
      offset,
    });
    apiGet<Paginated<AuditLog>>(`/api/audit-logs${qs}`)
      .then(setData)
      .catch(() => setData({ items: [], total: 0, limit: PAGE_SIZE, offset }));
  }, [q, resource, range, offset]);

  useEffect(() => {
    setOffset(0);
  }, [q, resource, range]);

  return (
    <>
      <PageHeader
        eyebrow="Administración · Bitácora"
        title="Auditoría"
        subtitle="Registro inmutable de cada acción crítica del sistema. Quién, qué, cuándo y sobre qué recurso."
      />

      <div className="mb-6 panel !p-4 flex flex-wrap items-center gap-4">
        <SearchBar value={q} onChange={setQ} placeholder="Buscar por email del actor…" />
        <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
      </div>

      <div className="mb-6 flex items-center gap-2 flex-wrap">
        <Eyebrow>Recurso</Eyebrow>
        <div className="flex gap-1 flex-wrap">
          {RESOURCE_FILTERS.map((f) => {
            const active = resource === f.id;
            return (
              <button
                key={f.id || 'all'}
                onClick={() => setResource(f.id)}
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
        <SkeletonTable rows={8} cols={4} />
      ) : data.items.length === 0 ? (
        <EmptyState
          glyph="∅"
          title={q || resource || range.from ? 'Sin coincidencias' : 'Bitácora vacía'}
          description={
            q || resource || range.from
              ? 'Ajusta los filtros para ampliar la búsqueda.'
              : 'Las acciones críticas del sistema se registrarán aquí automáticamente.'
          }
        />
      ) : (
        <>
          <Panel padded={false}>
            <ul className="divide-y divide-white/[0.04]">
              {data.items.map((log, i) => (
                <AuditRow key={log.id} log={log} index={data.offset + i + 1} />
              ))}
            </ul>
          </Panel>
          <Pagination
            total={data.total}
            limit={data.limit}
            offset={data.offset}
            onChange={setOffset}
            label="eventos"
          />
        </>
      )}
    </>
  );
}

function AuditRow({ log, index }: { log: AuditLog; index: number }) {
  const label = ACTION_LABEL[log.action] ?? log.action;
  const color = actionColor(log.action);
  const [expanded, setExpanded] = useState(false);

  const hasMeta = log.metadata && Object.keys(log.metadata).length > 0;

  return (
    <li className="px-6 py-4 hover:bg-white/[0.015] transition-colors">
      <div className="flex items-start gap-4">
        <div className="mono text-[0.65rem] text-slate-600 tabular-nums w-10 pt-1">
          {String(index).padStart(4, '0')}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className={`text-sm font-medium ${color}`}>{label}</span>
              <span className="mono text-[0.65rem] text-slate-600">{log.action}</span>
              {log.resource_id && (
                <span className="mono text-[0.65rem] text-amber-300/60">
                  #{log.resource_id.slice(0, 8)}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 tabular-nums">
              {formatDateTime(log.created_at)}
            </span>
          </div>

          <div className="mt-1 text-xs text-slate-500">
            por{' '}
            <span className="text-slate-300">{log.actor_email ?? 'sistema'}</span>{' '}
            {log.actor_role && (
              <span className="text-amber-300/60">· {log.actor_role}</span>
            )}
          </div>

          {hasMeta && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-[0.7rem] text-slate-500 hover:text-amber-300 transition-colors"
              >
                {expanded ? '▾ Ocultar detalle' : '▸ Ver detalle'}
              </button>
              {expanded && (
                <pre className="mt-2 text-[0.7rem] mono text-slate-400 bg-slate-950/60 border border-white/[0.04] rounded-md p-3 overflow-x-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
