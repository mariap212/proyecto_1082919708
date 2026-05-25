import { withRole } from '@/lib/with-role';
import { ok, fail } from '@/lib/api-helpers';
import { getOrderWithItems } from '@/lib/services/order-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor', 'bodeguero', 'conductor'], async (_req, _s, { params }) => {
  try {
    const o = await getOrderWithItems(params.id);
    if (!o) return fail(new Error('No encontrado'), 404);
    return ok(o);
  } catch (e) {
    return fail(e);
  }
});
