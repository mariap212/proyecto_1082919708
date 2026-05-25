import { withRole } from '@/lib/with-role';
import { ok, fail } from '@/lib/api-helpers';
import { generateInventoryReport } from '@/lib/services/report-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'bodeguero'], async () => {
  try {
    return ok(await generateInventoryReport());
  } catch (e) {
    return fail(e);
  }
});
