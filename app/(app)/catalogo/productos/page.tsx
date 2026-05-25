'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPatch, formatCurrency } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import { Panel, SkeletonTable, StatusDot, Button, EmptyState } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/Modal';
import type { EggType } from '@/lib/types';

export default function ProductosPage() {
  const [items, setItems] = useState<EggType[] | null>(null);
  const [editing, setEditing] = useState<EggType | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    apiGet<EggType[]>('/api/egg-types?all=true').then(setItems).catch(() => setItems([]));
  }, [refresh]);

  return (
    <>
      <PageHeader
        eyebrow="Catálogo · Productos"
        title="Tipos de huevo"
        subtitle="Configura precios y stock mínimo por tipo. Los cambios de precio no afectan pedidos pasados (RN-05)."
        actions={
          <Button onClick={() => setShowNew(true)}>+ Nuevo producto</Button>
        }
      />

      {items === null ? (
        <SkeletonTable rows={4} cols={5} />
      ) : items.length === 0 ? (
        <EmptyState
          glyph="∅"
          title="Sin productos"
          description="Crea el primer tipo de huevo para empezar a operar."
          action={<Button onClick={() => setShowNew(true)}>+ Nuevo producto</Button>}
        />
      ) : (
        <Panel padded={false}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th className="text-right">Precio/u</th>
                <th className="text-right">Stock mín.</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id}>
                  <td className="mono text-amber-300 text-sm">{e.code}</td>
                  <td className="text-slate-100">{e.name}</td>
                  <td className="text-right text-slate-200 tabular-nums">{formatCurrency(e.price_per_unit)}</td>
                  <td className="text-right text-slate-400 tabular-nums">{e.min_stock}</td>
                  <td>
                    {e.is_active ? (
                      <StatusDot color="emerald" label="activo" />
                    ) : (
                      <StatusDot color="slate" label="inactivo" />
                    )}
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => setEditing(e)}
                      className="text-amber-300 text-xs hover:text-amber-200 transition-colors"
                    >
                      Editar →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {showNew && (
        <NewProductModal
          onClose={() => setShowNew(false)}
          onSaved={() => {
            setShowNew(false);
            setRefresh((r) => r + 1);
          }}
        />
      )}
      {editing && (
        <EditProductModal
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setRefresh((r) => r + 1);
          }}
        />
      )}
    </>
  );
}

function NewProductModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [minStock, setMinStock] = useState(100);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await apiPost('/api/egg-types', {
        name,
        code,
        price_per_unit: Number(price),
        min_stock: minStock,
      });
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Nuevo producto" eyebrow="Catálogo" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre">
          <input
            className="input"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Huevo AAA Extra"
          />
        </Field>
        <Field label="Código (1-5 letras)">
          <input
            className="input mono uppercase"
            required
            maxLength={5}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="AAA"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio por unidad (COP)">
            <input
              className="input tabular-nums"
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="650"
            />
          </Field>
          <Field label="Stock mínimo">
            <input
              className="input tabular-nums"
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(Number(e.target.value))}
            />
          </Field>
        </div>
        {err && <p className="text-rose-400 text-sm">{err}</p>}
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Creando…' : 'Crear producto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EditProductModal({
  item,
  onClose,
  onSaved,
}: {
  item: EggType;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(Number(item.price_per_unit));
  const [minStock, setMinStock] = useState(item.min_stock);
  const [active, setActive] = useState(item.is_active);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await apiPatch(`/api/egg-types/${item.id}`, {
        name,
        price_per_unit: price,
        min_stock: minStock,
        is_active: active,
      });
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={`Editar producto ${item.code}`} eyebrow="Catálogo" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio por unidad">
            <input
              className="input tabular-nums"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </Field>
          <Field label="Stock mínimo">
            <input
              className="input tabular-nums"
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(Number(e.target.value))}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="accent-amber-500"
          />
          Activo en el catálogo
        </label>
        {err && <p className="text-rose-400 text-sm">{err}</p>}
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      {children}
    </label>
  );
}
