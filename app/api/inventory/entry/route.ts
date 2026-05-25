import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { created, fail, readJson } from '@/lib/api-helpers';
import { registerStockEntry } from '@/lib/services/inventory-service';

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
    return created(mov);
  } catch (e) {
    return fail(e);
  }
});
