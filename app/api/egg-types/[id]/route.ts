import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, fail, readJson } from '@/lib/api-helpers';
import { getEggType, updateEggType } from '@/lib/services/egg-type-service';
import { recordAudit } from '@/lib/services/audit-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor', 'bodeguero', 'conductor'], async (_req, _s, { params }) => {
  try {
    const eggType = await getEggType(params.id);
    if (!eggType) return fail(new Error('No encontrado'), 404);
    return ok(eggType);
  } catch (e) {
    return fail(e);
  }
});

export const PATCH = withRole(['admin'], async (req: NextRequest, session, { params }) => {
  try {
    const body = await readJson<{ name?: string; price_per_unit?: number; min_stock?: number; is_active?: boolean }>(req);
    const updated = await updateEggType(params.id, body);
    await recordAudit({
      actor: session,
      action: 'egg_type.update',
      resource_type: 'egg_type',
      resource_id: params.id,
      metadata: { code: updated.code, changes: body },
    });
    return ok(updated);
  } catch (e) {
    return fail(e);
  }
});
