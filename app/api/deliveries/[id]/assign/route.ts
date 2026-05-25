import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, fail, readJson } from '@/lib/api-helpers';
import { assignDriver } from '@/lib/services/delivery-service';
import { recordAudit } from '@/lib/services/audit-service';

export const dynamic = 'force-dynamic';

export const POST = withRole(['admin'], async (req: NextRequest, session, { params }) => {
  try {
    const body = await readJson<{ driver_id: string }>(req);
    const delivery = await assignDriver({
      delivery_id: params.id,
      driver_id: body.driver_id,
      assigned_by: session.id,
    });
    await recordAudit({
      actor: session,
      action: 'delivery.assign',
      resource_type: 'delivery',
      resource_id: params.id,
      metadata: { driver_id: body.driver_id, order_id: delivery.order_id },
    });
    return ok(delivery);
  } catch (e) {
    return fail(e);
  }
});
