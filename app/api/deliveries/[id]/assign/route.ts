import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, fail, readJson } from '@/lib/api-helpers';
import { assignDriver } from '@/lib/services/delivery-service';

export const dynamic = 'force-dynamic';

export const POST = withRole(['admin'], async (req: NextRequest, session, { params }) => {
  try {
    const body = await readJson<{ driver_id: string }>(req);
    return ok(await assignDriver({ delivery_id: params.id, driver_id: body.driver_id, assigned_by: session.id }));
  } catch (e) {
    return fail(e);
  }
});
