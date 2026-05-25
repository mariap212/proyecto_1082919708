'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost, buildQuery, formatDateTime, type Paginated } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Eyebrow,
  SkeletonTable,
  StatusDot,
  Button,
  EmptyState,
} from '@/components/ui/primitives';
import { DateRangePicker, Pagination } from '@/components/ui/filters';
import type { Delivery, DeliveryStatus, Role } from '@/lib/types';

interface UserBrief {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
}

interface Me {
  role: Role;
  id: string;
}

const STATUS_COLOR: Record<DeliveryStatus, 'amber' | 'sky' | 'violet' | 'emerald' | 'rose'> = {
  pendiente_asignacion: 'amber',
  asignada: 'sky',
  en_camino: 'violet',
  entregada: 'emerald',
  fallida: 'rose',
};

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  pendiente_asignacion: 'Por asignar',
  asignada: 'Asignada',
  en_camino: 'En camino',
  entregada: 'Entregada',
  fallida: 'Fallida',
};

const STAGES: DeliveryStatus[] = ['pendiente_asignacion', 'asignada', 'en_camino', 'entregada'];

const STATUS_FILTERS: Array<{ id: DeliveryStatus | ''; label: string }> = [
  { id: '', label: 'Todas' },
  { id: 'pendiente_asignacion', label: 'Por asignar' },
  { id: 'asignada', label: 'Asignadas' },
  { id: 'en_camino', label: 'En camino' },
  { id: 'entregada', label: 'Entregadas' },
  { id: 'fallida', label: 'Fallidas' },
];

const PAGE_SIZE = 15;

export default function EntregasPage() {
  const [data, setData] = useState<Paginated<Delivery> | null>(null);
  const [drivers, setDrivers] = useState<UserBrief[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [status, setStatus] = useState<DeliveryStatus | ''>('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [offset, setOffset] = useState(0);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setData(null);
    const qs = buildQuery({
      status: status || undefined,
      from: range.from ? new Date(range.from).toISOString() : undefined,
      to: range.to ? new Date(range.to + 'T23:59:59').toISOString() : undefined,
      limit: PAGE_SIZE,
      offset,
    });
    apiGet<Paginated<Delivery>>(`/api/deliveries${qs}`)
      .then(setData)
      .catch(() => setData({ items: [], total: 0, limit: PAGE_SIZE, offset }));
    apiGet<Me>('/api/auth/me').then(setMe).catch(() => undefined);
  }, [status, range, offset, refresh]);

  useEffect(() => {
    setOffset(0);
  }, [status, range]);

  useEffect(() => {
    if (me?.role === 'admin') {
      apiGet<UserBrief[]>('/api/users')
        .then((us) => setDrivers(us.filter((u) => u.role === 'conductor' && u.is_active)))
        .catch(() => undefined);
    }
  }, [me]);

  const isConductor = me?.role === 'conductor';
  const isAdmin = me?.role === 'admin';

  async function assign(deliveryId: string, driverId: string) {
    try {
      await apiPost(`/api/deliveries/${deliveryId}/assign`, { driver_id: driverId });
      setRefresh((r) => r + 1);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function changeStatus(deliveryId: string, new_status: 'en_camino' | 'entregada' | 'fallida') {
    let incident_note: string | undefined;
    if (new_status === 'fallida') {
      const r = prompt('Motivo de la falla (mín. 3 caracteres):');
      if (!r || r.length < 3) return;
      incident_note = r;
    }
    try {
      await apiPost(`/api/deliveries/${deliveryId}/status`, { new_status, incident_note });
      setRefresh((r) => r + 1);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={isConductor ? 'Conductor · Mis rutas' : 'Comercial · Logística'}
        title={isConductor ? 'Mis entregas' : 'Entregas'}
        subtitle={
          isConductor
            ? 'Rutas asignadas. Marca el estado conforme avanzas. Si una entrega falla, el stock se devuelve automáticamente.'
            : 'Asigna conductores y supervisa el ciclo completo de cada despacho.'
        }
      />

      {/* Filters */}
      <div className="mb-6 panel !p-4 flex flex-wrap items-center gap-4">
        <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
      </div>

      <div className="mb-6 flex items-center gap-2 flex-wrap">
        <Eyebrow>Estado</Eyebrow>
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => {
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
        <SkeletonTable rows={5} cols={4} />
      ) : data.items.length === 0 ? (
        <EmptyState
          glyph="—"
          title={status || range.from ? 'Sin coincidencias' : 'Sin entregas registradas'}
          description={
            status || range.from
              ? 'Ajusta los filtros para ampliar la búsqueda.'
              : 'Las entregas aparecen automáticamente al aprobar un pedido.'
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {data.items.map((d, i) => (
              <DeliveryCard
                key={d.id}
                delivery={d}
                drivers={drivers}
                isAdmin={Boolean(isAdmin)}
                isConductor={Boolean(isConductor)}
                onAssign={(driverId) => assign(d.id, driverId)}
                onChangeStatus={(s) => changeStatus(d.id, s)}
                style={{ animationDelay: `${i * 40}ms` }}
              />
            ))}
          </div>
          <Pagination
            total={data.total}
            limit={data.limit}
            offset={data.offset}
            onChange={setOffset}
            label="entregas"
          />
        </>
      )}
    </>
  );
}

function DeliveryCard({
  delivery,
  drivers,
  isAdmin,
  isConductor,
  onAssign,
  onChangeStatus,
  style,
}: {
  delivery: Delivery;
  drivers: UserBrief[];
  isAdmin: boolean;
  isConductor: boolean;
  onAssign: (driverId: string) => void;
  onChangeStatus: (status: 'en_camino' | 'entregada' | 'fallida') => void;
  style?: React.CSSProperties;
}) {
  const [selectedDriver, setSelectedDriver] = useState('');
  const isFailed = delivery.status === 'fallida';
  const currentStageIndex = STAGES.indexOf(delivery.status);

  return (
    <div className="panel !p-6 animate-rise hover:border-white/[0.1] transition-colors group" style={style}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-baseline gap-4">
          <div>
            <Eyebrow>Pedido</Eyebrow>
            <div className="mono text-amber-300/80 text-sm mt-1">#{delivery.order_id.slice(0, 8)}</div>
          </div>
          <div className="border-l border-white/[0.06] pl-4">
            <Eyebrow>Entrega</Eyebrow>
            <div className="mono text-slate-400 text-sm mt-1">#{delivery.id.slice(0, 8)}</div>
          </div>
          <div className="border-l border-white/[0.06] pl-4">
            <Eyebrow>Creada</Eyebrow>
            <div className="text-xs text-slate-500 mt-1 tabular-nums">
              {formatDateTime(delivery.created_at)}
            </div>
          </div>
        </div>
        <StatusDot color={STATUS_COLOR[delivery.status]} label={STATUS_LABEL[delivery.status]} pulse={!isFailed && delivery.status !== 'entregada'} />
      </div>

      {/* State machine progress */}
      {!isFailed && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {STAGES.map((stage, i) => {
              const reached = i <= currentStageIndex;
              const isCurrent = i === currentStageIndex;
              return (
                <div key={stage} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center gap-2 -mx-2">
                    <div
                      className={`w-6 h-6 rounded-full grid place-items-center text-[0.6rem] mono transition-all duration-500 ${
                        reached
                          ? isCurrent
                            ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-400/20'
                            : 'bg-amber-500/30 text-amber-200'
                          : 'bg-white/[0.04] text-slate-600'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <span
                      className={`text-[0.65rem] ${
                        reached ? 'text-slate-300' : 'text-slate-600'
                      } whitespace-nowrap`}
                    >
                      {STATUS_LABEL[stage]}
                    </span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className="flex-1 h-px mx-1 -mt-5">
                      <div
                        className={`h-full transition-all duration-500 ${
                          i < currentStageIndex
                            ? 'bg-gradient-to-r from-amber-400/40 to-amber-400/40'
                            : 'bg-white/[0.06]'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Incident note */}
      {delivery.incident_note && (
        <div className="mb-6 panel-tight !p-4 border-rose-500/20 bg-rose-500/[0.03]">
          <Eyebrow>Incidencia</Eyebrow>
          <p className="text-sm text-rose-200 mt-1">{delivery.incident_note}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {delivery.driver_id ? (
            <>
              <span className="mono">Conductor</span>
              <span className="text-slate-300">{delivery.driver_id.slice(0, 8)}</span>
            </>
          ) : (
            <span className="italic text-slate-600">Sin conductor asignado</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && delivery.status === 'pendiente_asignacion' && (
            <div className="flex gap-2">
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="select !py-1.5 !px-3 text-xs"
              >
                <option value="">Asignar conductor…</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => selectedDriver && onAssign(selectedDriver)}
                disabled={!selectedDriver}
              >
                Asignar
              </Button>
            </div>
          )}
          {(isConductor || isAdmin) && delivery.status === 'asignada' && (
            <Button onClick={() => onChangeStatus('en_camino')}>Iniciar ruta</Button>
          )}
          {(isConductor || isAdmin) && delivery.status === 'en_camino' && (
            <>
              <Button variant="danger" onClick={() => onChangeStatus('fallida')}>
                Reportar falla
              </Button>
              <Button onClick={() => onChangeStatus('entregada')}>
                ✓ Marcar entregada
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
