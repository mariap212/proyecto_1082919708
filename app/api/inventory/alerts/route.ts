import { withRole } from '@/lib/with-role';
import { ok, fail } from '@/lib/api-helpers';
import { getLowStockAlerts } from '@/lib/services/inventory-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor', 'bodeguero'], async () => {
  try {
    return ok(await getLowStockAlerts());
  } catch (e) {
    return fail(e);
  }
});
