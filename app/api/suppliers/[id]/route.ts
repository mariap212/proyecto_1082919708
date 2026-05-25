import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, fail, readJson } from '@/lib/api-helpers';
import { getSupplier, updateSupplier, deactivateSupplier } from '@/lib/services/supplier-service';
import { recordAudit } from '@/lib/services/audit-service';

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

export const PATCH = withRole(['admin', 'bodeguero'], async (req: NextRequest, session, { params }) => {
  try {
    const body = await readJson<Record<string, unknown>>(req);
    const updated = await updateSupplier(params.id, body);
    await recordAudit({
      actor: session,
      action: 'supplier.update',
      resource_type: 'supplier',
      resource_id: params.id,
      metadata: { name: updated.name, changes: body },
    });
    return ok(updated);
  } catch (e) {
    return fail(e);
  }
});

export const DELETE = withRole(['admin'], async (_req, session, { params }) => {
  try {
    await deactivateSupplier(params.id);
    await recordAudit({
      actor: session,
      action: 'supplier.deactivate',
      resource_type: 'supplier',
      resource_id: params.id,
    });
    return ok({ id: params.id, deactivated: true });
  } catch (e) {
    return fail(e);
  }
});
