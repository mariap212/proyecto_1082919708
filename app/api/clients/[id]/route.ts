import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, fail, readJson } from '@/lib/api-helpers';
import { getClient, updateClient, deactivateClient } from '@/lib/services/client-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor', 'bodeguero'], async (_req, _s, { params }) => {
  try {
    const c = await getClient(params.id);
    if (!c) return fail(new Error('No encontrado'), 404);
    return ok(c);
  } catch (e) {
    return fail(e);
  }
});

export const PATCH = withRole(['admin', 'vendedor'], async (req: NextRequest, _s, { params }) => {
  try {
    const body = await readJson<Record<string, unknown>>(req);
    return ok(await updateClient(params.id, body));
  } catch (e) {
    return fail(e);
  }
});

export const DELETE = withRole(['admin'], async (_req, _s, { params }) => {
  try {
    await deactivateClient(params.id);
    return ok({ id: params.id, deactivated: true });
  } catch (e) {
    return fail(e);
  }
});
