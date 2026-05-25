'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { CrudTable } from '@/components/ui/CrudTable';
import type { Supplier } from '@/lib/types';

export default function ProveedoresPage() {
  return (
    <>
      <PageHeader title="Proveedores" subtitle="Granjas y avícolas con las que trabajamos" />
      <CrudTable<Supplier>
        endpoint="/api/suppliers"
        title="proveedor"
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'contact', label: 'Contacto' },
          { key: 'phone', label: 'Teléfono' },
          { key: 'address', label: 'Dirección' },
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
