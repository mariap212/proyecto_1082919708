import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, fail, readJson } from '@/lib/api-helpers';
import { getSupplier, updateSupplier, deactivateSupplier } from '@/lib/services/supplier-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor', 'bodeguero'], async (_req, _s, { params }) => {
  try {
    const s = await getSupplier(params.id);
    if (!s) return fail(new Error('No encontrado'), 404);
    return ok(s);
  } catch (e) {
    return fail(e);
  }
});

export const PATCH = withRole(['admin', 'bodeguero'], async (req: NextRequest, _s, { params }) => {
  try {
    const body = await readJson<Record<string, unknown>>(req);
    return ok(await updateSupplier(params.id, body));
  } catch (e) {
    return fail(e);
  }
});

export const DELETE = withRole(['admin'], async (_req, _s, { params }) => {
  try {
    await deactivateSupplier(params.id);
    return ok({ id: params.id, deactivated: true });
  } catch (e) {
    return fail(e);
  }
});
