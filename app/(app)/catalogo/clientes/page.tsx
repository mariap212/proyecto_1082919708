'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { CrudTable } from '@/components/ui/CrudTable';
import type { Client } from '@/lib/types';

export default function ClientesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Catálogo · Clientes"
        title="Mayoristas y distribuidores"
        subtitle="Compradores institucionales para pedidos al por mayor. El NIT es identificador único."
      />
      <CrudTable<Client>
        endpoint="/api/clients"
        title="cliente"
        eyebrow="Catálogo · Clientes"
        searchPlaceholder="Buscar por nombre o NIT…"
        columns={[
          {
            key: 'name',
            label: 'Nombre',
            render: (r) => <span className="text-slate-100 font-medium">{r.name}</span>,
          },
          {
            key: 'nit',
            label: 'NIT',
            render: (r) => <span className="mono text-amber-300/80 text-sm">{r.nit}</span>,
          },
          {
            key: 'phone',
            label: 'Teléfono',
            render: (r) => (
              <span className="mono text-slate-400 text-sm">{r.phone ?? '—'}</span>
            ),
          },
          {
            key: 'address',
            label: 'Dirección',
            render: (r) => (
              <span className="text-slate-400 text-xs max-w-xs block truncate">
                {r.address ?? '—'}
              </span>
            ),
          },
        ]}
        fields={[
          { key: 'name', label: 'Razón social', required: true },
          { key: 'nit', label: 'NIT', required: true },
          { key: 'phone', label: 'Teléfono', type: 'tel' },
          { key: 'address', label: 'Dirección' },
          { key: 'notes', label: 'Notas' },
        ]}
      />
    </>
  );
}
