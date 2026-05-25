import { withRole } from '@/lib/with-role';
import { ok, fail } from '@/lib/api-helpers';
import { processOrderApproval } from '@/lib/services/order-service';

export const dynamic = 'force-dynamic';

// RN-11 + RN-08: solo admin aprueba pedidos
export const POST = withRole(['admin'], async (_req, session, { params }) => {
  try {
    const result = await processOrderApproval({ order_id: params.id, approved_by: session.id });
    return ok(result);
  } catch (e) {
    return fail(e);
  }
});
