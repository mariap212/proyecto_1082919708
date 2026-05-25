import { withRole } from '@/lib/with-role';
import { ok, fail } from '@/lib/api-helpers';
import { cancelOrder } from '@/lib/services/order-service';
import { recordAudit } from '@/lib/services/audit-service';

export const dynamic = 'force-dynamic';

export const POST = withRole(['admin', 'vendedor'], async (_req, session, { params }) => {
  try {
    const order = await cancelOrder(params.id, session.id);
    await recordAudit({
      actor: session,
      action: 'order.cancel',
      resource_type: 'order',
      resource_id: params.id,
      metadata: { total: Number(order.total), client_id: order.client_id },
    });
    return ok(order);
  } catch (e) {
    return fail(e);
  }
});
