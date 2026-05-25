import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, fail, readJson } from '@/lib/api-helpers';
import { getEggType, updateEggType } from '@/lib/services/egg-type-service';

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

export const PATCH = withRole(['admin'], async (req: NextRequest, _s, { params }) => {
  try {
    const body = await readJson<{ name?: string; price_per_unit?: number; min_stock?: number; is_active?: boolean }>(req);
    return ok(await updateEggType(params.id, body));
  } catch (e) {
    return fail(e);
  }
});
