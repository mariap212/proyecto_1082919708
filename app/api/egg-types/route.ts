import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, created, fail, readJson } from '@/lib/api-helpers';
import { listEggTypes, createEggType } from '@/lib/services/egg-type-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor', 'bodeguero', 'conductor'], async (req) => {
  try {
    const includeInactive = new URL(req.url).searchParams.get('all') === 'true';
    return ok(await listEggTypes(includeInactive));
  } catch (e) {
    return fail(e);
  }
});

export const POST = withRole(['admin'], async (req: NextRequest) => {
  try {
    const body = await readJson<{ name: string; code: string; price_per_unit: number; min_stock?: number }>(req);
    return created(await createEggType(body));
  } catch (e) {
    return fail(e);
  }
});
