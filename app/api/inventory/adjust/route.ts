import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { created, fail, readJson } from '@/lib/api-helpers';
import { adjustStockManual } from '@/lib/services/inventory-service';

export const dynamic = 'force-dynamic';

// Solo admin (CU-05): ajustar stock manualmente
export const POST = withRole(['admin'], async (req: NextRequest, session) => {
  try {
    const body = await readJson<{ egg_type_id: string; delta: number; notes: string }>(req);
    const mov = await adjustStockManual({ ...body, recorded_by: session.id });
    return created(mov);
  } catch (e) {
    return fail(e);
  }
});
