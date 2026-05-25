import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, fail, readJson } from '@/lib/api-helpers';
import { getClient, updateClient, deactivateClient } from '@/lib/services/client-service';
import { recordAudit } from '@/lib/services/audit-service';

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

export const PATCH = withRole(['admin', 'vendedor'], async (req: NextRequest, session, { params }) => {
  try {
    const body = await readJson<Record<string, unknown>>(req);
    const updated = await updateClient(params.id, body);
    await recordAudit({
      actor: session,
      action: 'client.update',
      resource_type: 'client',
      resource_id: params.id,
      metadata: { name: updated.name, nit: updated.nit, changes: body },
    });
    return ok(updated);
  } catch (e) {
    return fail(e);
  }
});

export const DELETE = withRole(['admin'], async (_req, session, { params }) => {
  try {
    await deactivateClient(params.id);
    await recordAudit({
      actor: session,
      action: 'client.deactivate',
      resource_type: 'client',
      resource_id: params.id,
    });
    return ok({ id: params.id, deactivated: true });
  } catch (e) {
    return fail(e);
  }
});
