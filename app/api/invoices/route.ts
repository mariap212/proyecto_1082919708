import { withRole } from '@/lib/with-role';
import { ok, fail } from '@/lib/api-helpers';
import { listInvoices } from '@/lib/services/invoice-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor'], async (req) => {
  try {
    const u = new URL(req.url);
    return ok(
      await listInvoices({
        from: u.searchParams.get('from') ?? undefined,
        to: u.searchParams.get('to') ?? undefined,
        include_voided: u.searchParams.get('include_voided') === 'true',
        q: u.searchParams.get('q') ?? undefined,
        limit: u.searchParams.get('limit') ? parseInt(u.searchParams.get('limit')!, 10) : undefined,
        offset: u.searchParams.get('offset') ? parseInt(u.searchParams.get('offset')!, 10) : undefined,
      })
    );
  } catch (e) {
    return fail(e);
  }
});
