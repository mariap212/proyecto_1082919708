import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { created, fail, readJson } from '@/lib/api-helpers';
import { adjustStockManual } from '@/lib/services/inventory-service';
import { recordAudit } from '@/lib/services/audit-service';

export const dynamic = 'force-dynamic';

// Solo admin (CU-05): ajustar stock manualmente
export const POST = withRole(['admin'], async (req: NextRequest, session) => {
  try {
    const body = await readJson<{ egg_type_id: string; delta: number; notes: string }>(req);
    const mov = await adjustStockManual({ ...body, recorded_by: session.id });
    await recordAudit({
      actor: session,
      action: 'inventory.adjust',
      resource_type: 'inventory',
      resource_id: body.egg_type_id,
      metadata: { delta: body.delta, notes: body.notes, movement_id: mov.id },
    });
    return created(mov);
  } catch (e) {
    return fail(e);
  }
});
