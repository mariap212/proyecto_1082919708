import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, fail, readJson } from '@/lib/api-helpers';
import { voidInvoice } from '@/lib/services/invoice-service';
import { recordAudit } from '@/lib/services/audit-service';

export const dynamic = 'force-dynamic';

// RN-07: factura no se elimina, solo se anula
export const POST = withRole(['admin'], async (req: NextRequest, session, { params }) => {
  try {
    const body = await readJson<{ reason: string }>(req);
    const inv = await voidInvoice(params.id, body.reason, session.id);
    await recordAudit({
      actor: session,
      action: 'invoice.void',
      resource_type: 'invoice',
      resource_id: params.id,
      metadata: {
        invoice_number: inv.invoice_number,
        total: Number(inv.total),
        reason: body.reason,
      },
    });
    return ok(inv);
  } catch (e) {
    return fail(e);
  }
});
