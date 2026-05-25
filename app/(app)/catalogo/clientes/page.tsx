'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { CrudTable } from '@/components/ui/CrudTable';
import type { Client } from '@/lib/types';

export default function ClientesPage() {
  return (
    <>
      <PageHeader title="Clientes" subtitle="Mayoristas y distribuidores" />
      <CrudTable<Client>
        endpoint="/api/clients"
        title="cliente"
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'nit', label: 'NIT' },
          { key: 'phone', label: 'Teléfono' },
          { key: 'address', label: 'Dirección' },
        ]}
        fields={[
          { key: 'name', label: 'Nombre', required: true },
          { key: 'nit', label: 'NIT', required: true },
          { key: 'phone', label: 'Teléfono', type: 'tel' },
          { key: 'address', label: 'Dirección' },
          { key: 'notes', label: 'Notas' },
        ]}
      />
    </>
  );
}
