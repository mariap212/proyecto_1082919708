'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { CrudTable } from '@/components/ui/CrudTable';
import type { Supplier } from '@/lib/types';

export default function ProveedoresPage() {
  return (
    <>
      <PageHeader
        eyebrow="Catálogo · Proveedores"
        title="Granjas y avícolas"
        subtitle="Red de proveedores con los que se registran entradas de mercancía."
      />
      <CrudTable<Supplier>
        endpoint="/api/suppliers"
        title="proveedor"
        eyebrow="Catálogo · Proveedores"
        columns={[
          {
            key: 'name',
            label: 'Nombre',
            render: (r) => <span className="text-slate-100 font-medium">{r.name}</span>,
          },
          { key: 'contact', label: 'Contacto' },
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
          { key: 'name', label: 'Nombre', required: true },
          { key: 'contact', label: 'Persona de contacto' },
          { key: 'phone', label: 'Teléfono', type: 'tel' },
          { key: 'address', label: 'Dirección' },
          { key: 'notes', label: 'Notas' },
        ]}
      />
    </>
  );
}
