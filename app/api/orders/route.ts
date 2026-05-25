import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, created, fail, readJson } from '@/lib/api-helpers';
import { listOrders, createOrder } from '@/lib/services/order-service';
import type { OrderStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = withRole(['admin', 'vendedor', 'bodeguero'], async (req) => {
  try {
    const u = new URL(req.url);
    return ok(
      await listOrders({
        status: (u.searchParams.get('status') as OrderStatus | null) ?? undefined,
        client_id: u.searchParams.get('client_id') ?? undefined,
        from: u.searchParams.get('from') ?? undefined,
        to: u.searchParams.get('to') ?? undefined,
        limit: u.searchParams.get('limit') ? parseInt(u.searchParams.get('limit')!, 10) : undefined,
      })
    );
  } catch (e) {
    return fail(e);
  }
});

export const POST = withRole(['admin', 'vendedor'], async (req: NextRequest, session) => {
  try {
    const body = await readJson<{
      client_id: string;
      items: Array<{ egg_type_id: string; quantity: number }>;
      notes?: string;
    }>(req);
    return created(await createOrder({ ...body, created_by: session.id }));
  } catch (e) {
    return fail(e);
  }
});
