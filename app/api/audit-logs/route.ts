import { withRole } from '@/lib/with-role';
import { ok, fail } from '@/lib/api-helpers';
import { listAuditLogs } from '@/lib/services/audit-service';
import type { AuditAction, AuditResource } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Solo admin (RN-08 implícita: auditoría es información sensible)
export const GET = withRole(['admin'], async (req) => {
  try {
    const u = new URL(req.url);
    return ok(
      await listAuditLogs({
        q: u.searchParams.get('q') ?? undefined,
        action: (u.searchParams.get('action') as AuditAction | null) ?? undefined,
        resource_type: (u.searchParams.get('resource_type') as AuditResource | null) ?? undefined,
        resource_id: u.searchParams.get('resource_id') ?? undefined,
        actor_id: u.searchParams.get('actor_id') ?? undefined,
        from: u.searchParams.get('from') ?? undefined,
        to: u.searchParams.get('to') ?? undefined,
        limit: u.searchParams.get('limit') ? parseInt(u.searchParams.get('limit')!, 10) : undefined,
        offset: u.searchParams.get('offset') ? parseInt(u.searchParams.get('offset')!, 10) : undefined,
      })
    );
  } catch (e) {
    return fail(e);
  }
});
