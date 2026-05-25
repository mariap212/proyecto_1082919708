import { withRole } from '@/lib/with-role';
import { ok, fail } from '@/lib/api-helpers';
import { generateSalesReport } from '@/lib/services/report-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin'], async (req) => {
  try {
    const u = new URL(req.url);
    const to = u.searchParams.get('to') ?? new Date().toISOString();
    const from =
      u.searchParams.get('from') ?? new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    return ok(await generateSalesReport({ from, to }));
  } catch (e) {
    return fail(e);
  }
});
