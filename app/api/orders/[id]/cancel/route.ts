import { withRole } from '@/lib/with-role';
import { ok, fail } from '@/lib/api-helpers';
import { cancelOrder } from '@/lib/services/order-service';

export const dynamic = 'force-dynamic';

export const POST = withRole(['admin', 'vendedor'], async (_req, session, { params }) => {
  try {
    return ok(await cancelOrder(params.id, session.id));
  } catch (e) {
    return fail(e);
  }
});
