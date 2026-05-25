import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, created, fail, readJson } from '@/lib/api-helpers';
import { listSuppliers, createSupplier } from '@/lib/services/supplier-service';
import { recordAudit } from '@/lib/services/audit-service';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor', 'bodeguero'], async (req) => {
  try {
    const u = new URL(req.url);
    return ok(
      await listSuppliers({
        includeInactive: u.searchParams.get('all') === 'true',
        q: u.searchParams.get('q') ?? undefined,
      })
    );
  } catch (e) {
    return fail(e);
  }
});

export const POST = withRole(['admin', 'bodeguero'], async (req: NextRequest, session) => {
  try {
    const body = await readJson<{ name: string; contact: string | null; phone: string | null; address: string | null; notes: string | null }>(req);
    const supplier = await createSupplier(body);
    await recordAudit({
      actor: session,
      action: 'supplier.create',
      resource_type: 'supplier',
      resource_id: supplier.id,
      metadata: { name: supplier.name },
    });
    return created(supplier);
  } catch (e) {
    return fail(e);
  }
});
