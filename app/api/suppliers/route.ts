import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, created, fail, readJson } from '@/lib/api-helpers';
import { listSuppliers, createSupplier } from '@/lib/services/supplier-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor', 'bodeguero'], async (req) => {
  try {
    const includeInactive = new URL(req.url).searchParams.get('all') === 'true';
    return ok(await listSuppliers(includeInactive));
  } catch (e) {
    return fail(e);
  }
});

export const POST = withRole(['admin', 'bodeguero'], async (req: NextRequest) => {
  try {
    const body = await readJson<{ name: string; contact: string | null; phone: string | null; address: string | null; notes: string | null }>(req);
    return created(await createSupplier(body));
  } catch (e) {
    return fail(e);
  }
});
