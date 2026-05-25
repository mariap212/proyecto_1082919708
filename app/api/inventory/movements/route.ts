import { withRole } from '@/lib/with-role';
import { ok, fail } from '@/lib/api-helpers';
import { listMovements } from '@/lib/services/inventory-service';
import type { InventoryMovementType } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor', 'bodeguero'], async (req) => {
  try {
    const u = new URL(req.url);
    return ok(
      await listMovements({
        egg_type_id: u.searchParams.get('egg_type_id') ?? undefined,
        type: (u.searchParams.get('type') as InventoryMovementType | null) ?? undefined,
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
