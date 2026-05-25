import { withRole } from '@/lib/with-role';
import { ok, fail } from '@/lib/api-helpers';
import { getInvoice } from '@/lib/services/invoice-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor'], async (_req, _s, { params }) => {
  try {
    const inv = await getInvoice(params.id);
    if (!inv) return fail(new Error('No encontrada'), 404);
    return ok(inv);
  } catch (e) {
    return fail(e);
  }
});
