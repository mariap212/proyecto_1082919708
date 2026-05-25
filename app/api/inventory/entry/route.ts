import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { created, fail, readJson } from '@/lib/api-helpers';
import { registerStockEntry } from '@/lib/services/inventory-service';
import { recordAudit } from '@/lib/services/audit-service';

export const dynamic = 'force-dynamic';

// CU-01: registrar entrada de huevos desde proveedor
export const POST = withRole(['admin', 'bodeguero'], async (req: NextRequest, session) => {
  try {
    const body = await readJson<{
      egg_type_id: string;
      quantity: number;
      supplier_id?: string;
      notes?: string;
    }>(req);
    const mov = await registerStockEntry({ ...body, recorded_by: session.id });
    await recordAudit({
      actor: session,
      action: 'inventory.entry',
      resource_type: 'inventory',
      resource_id: body.egg_type_id,
      metadata: {
        quantity: body.quantity,
        supplier_id: body.supplier_id,
        notes: body.notes,
        movement_id: mov.id,
      },
    });
    return created(mov);
  } catch (e) {
    return fail(e);
  }
});
