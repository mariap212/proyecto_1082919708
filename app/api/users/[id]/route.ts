import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, fail, readJson } from '@/lib/api-helpers';
import { getUser, updateUser } from '@/lib/services/user-service';
import { recordAudit } from '@/lib/services/audit-service';
import type { Role } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin'], async (_req, _s, { params }) => {
  try {
    const u = await getUser(params.id);
    if (!u) return fail(new Error('No encontrado'), 404);
    const { password_hash: _ph, ...safe } = u;
    return ok(safe);
  } catch (e) {
    return fail(e);
  }
});

export const PATCH = withRole(['admin'], async (req: NextRequest, session, { params }) => {
  try {
    const body = await readJson<{ name?: string; role?: Role; is_active?: boolean; password?: string }>(req);
    const u = await updateUser(params.id, body);
    const { password_hash: _ph, ...safe } = u;
    const changes: Record<string, unknown> = {};
    if (body.name !== undefined) changes.name = body.name;
    if (body.role !== undefined) changes.role = body.role;
    if (body.is_active !== undefined) changes.is_active = body.is_active;
    if (body.password) changes.password_changed = true;
    await recordAudit({
      actor: session,
      action: 'user.update',
      resource_type: 'user',
      resource_id: params.id,
      metadata: { target_email: u.email, changes },
    });
    return ok(safe);
  } catch (e) {
    return fail(e);
  }
});
