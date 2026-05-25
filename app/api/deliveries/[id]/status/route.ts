import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, fail, readJson } from '@/lib/api-helpers';
import { updateDeliveryStatus } from '@/lib/services/delivery-service';

export const dynamic = 'force-dynamic';

// Conductor cambia su propio estado, admin puede cambiar cualquiera
export const POST = withRole(['admin', 'conductor'], async (req: NextRequest, session, { params }) => {
  try {
    const body = await readJson<{ new_status: 'en_camino' | 'entregada' | 'fallida'; incident_note?: string }>(req);
    const updated = await updateDeliveryStatus({
      delivery_id: params.id,
      new_status: body.new_status,
      incident_note: body.incident_note,
      actor_id: session.id,
    });
    return ok(updated);
  } catch (e) {
    return fail(e);
  }
});
