import { withRole } from '@/lib/with-role';
import { ok, fail } from '@/lib/api-helpers';
import { getDelivery } from '@/lib/services/delivery-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor', 'bodeguero', 'conductor'], async (_req, _s, { params }) => {
  try {
    const d = await getDelivery(params.id);
    if (!d) return fail(new Error('No encontrado'), 404);
    return ok(d);
  } catch (e) {
    return fail(e);
  }
});
