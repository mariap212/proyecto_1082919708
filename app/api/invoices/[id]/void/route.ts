import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, fail, readJson } from '@/lib/api-helpers';
import { voidInvoice } from '@/lib/services/invoice-service';

export const dynamic = 'force-dynamic';

// RN-07: factura no se elimina, solo se anula
export const POST = withRole(['admin'], async (req: NextRequest, session, { params }) => {
  try {
    const body = await readJson<{ reason: string }>(req);
    return ok(await voidInvoice(params.id, body.reason, session.id));
  } catch (e) {
    return fail(e);
  }
});
