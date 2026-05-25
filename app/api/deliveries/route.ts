import { withRole } from '@/lib/with-role';
import { ok, fail } from '@/lib/api-helpers';
import { listDeliveries } from '@/lib/services/delivery-service';
import type { DeliveryStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor', 'bodeguero', 'conductor'], async (req, session) => {
  try {
    const u = new URL(req.url);
    // Si es conductor, fuerza filtrar por su propio driver_id (vista "mis entregas")
    const driver_id = session.role === 'conductor' ? session.id : u.searchParams.get('driver_id') ?? undefined;
    return ok(
      await listDeliveries({
        status: (u.searchParams.get('status') as DeliveryStatus | null) ?? undefined,
        driver_id: driver_id ?? undefined,
      })
    );
  } catch (e) {
    return fail(e);
  }
});
