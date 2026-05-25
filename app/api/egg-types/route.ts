import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, created, fail, readJson } from '@/lib/api-helpers';
import { listEggTypes, createEggType } from '@/lib/services/egg-type-service';
import { recordAudit } from '@/lib/services/audit-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor', 'bodeguero', 'conductor'], async (req) => {
  try {
    const includeInactive = new URL(req.url).searchParams.get('all') === 'true';
    return ok(await listEggTypes(includeInactive));
  } catch (e) {
    return fail(e);
  }
});

export const POST = withRole(['admin'], async (req: NextRequest, session) => {
  try {
    const body = await readJson<{
      name: string;
      code: string;
      price_per_unit: number;
      min_stock?: number;
    }>(req);
    const egg = await createEggType(body);
    await recordAudit({
      actor: session,
      action: 'egg_type.create',
      resource_type: 'egg_type',
      resource_id: egg.id,
      metadata: { code: egg.code, name: egg.name, price: egg.price_per_unit, min_stock: egg.min_stock },
    });
    return created(egg);
  } catch (e) {
    return fail(e);
  }
});
