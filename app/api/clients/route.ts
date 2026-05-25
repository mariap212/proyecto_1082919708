import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, created, fail, readJson } from '@/lib/api-helpers';
import { listClients, createClient } from '@/lib/services/client-service';
import { recordAudit } from '@/lib/services/audit-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor', 'bodeguero'], async (req) => {
  try {
    const u = new URL(req.url);
    return ok(
      await listClients({
        includeInactive: u.searchParams.get('all') === 'true',
        q: u.searchParams.get('q') ?? undefined,
      })
    );
  } catch (e) {
    return fail(e);
  }
});

export const POST = withRole(['admin', 'vendedor'], async (req: NextRequest, session) => {
  try {
    const body = await readJson<{ name: string; nit: string; phone: string | null; address: string | null; notes: string | null }>(req);
    const client = await createClient(body);
    await recordAudit({
      actor: session,
      action: 'client.create',
      resource_type: 'client',
      resource_id: client.id,
      metadata: { name: client.name, nit: client.nit },
    });
    return created(client);
  } catch (e) {
    return fail(e);
  }
});
