import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, created, fail, readJson } from '@/lib/api-helpers';
import { listClients, createClient } from '@/lib/services/client-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor', 'bodeguero'], async (req) => {
  try {
    const includeInactive = new URL(req.url).searchParams.get('all') === 'true';
    return ok(await listClients(includeInactive));
  } catch (e) {
    return fail(e);
  }
});

export const POST = withRole(['admin', 'vendedor'], async (req: NextRequest) => {
  try {
    const body = await readJson<{ name: string; nit: string; phone: string | null; address: string | null; notes: string | null }>(req);
    return created(await createClient(body));
  } catch (e) {
    return fail(e);
  }
});
