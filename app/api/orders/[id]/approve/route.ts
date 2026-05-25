import { withRole } from '@/lib/with-role';
import { ok, fail } from '@/lib/api-helpers';
import { processOrderApproval } from '@/lib/services/order-service';
import { recordAudit } from '@/lib/services/audit-service';

export const dynamic = 'force-dynamic';

// RN-11 + RN-08: solo admin aprueba pedidos
export const POST = withRole(['admin'], async (_req, session, { params }) => {
  try {
    const result = await processOrderApproval({ order_id: params.id, approved_by: session.id });
    await recordAudit({
      actor: session,
      action: 'order.approve',
      resource_type: 'order',
      resource_id: params.id,
      metadata: {
        invoice_number: result.invoice_number,
        delivery_id: result.delivery_id,
        total: Number(result.order.total),
        client_id: result.order.client_id,
      },
    });
    return ok(result);
  } catch (e) {
    return fail(e);
  }
});
