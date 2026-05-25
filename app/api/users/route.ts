import { NextRequest } from 'next/server';
import { withRole } from '@/lib/with-role';
import { ok, created, fail, readJson } from '@/lib/api-helpers';
import { listUsers, createUser } from '@/lib/services/user-service';
import type { Role } from '@/lib/types';

export const dynamic = 'force-dynamic';

// RN-08: solo admin
export const GET = withRole(['admin'], async (req) => {
  try {
    const u = new URL(req.url);
    const users = await listUsers({
      q: u.searchParams.get('q') ?? undefined,
      role: (u.searchParams.get('role') as Role | null) ?? undefined,
    });
    return ok(users.map(({ password_hash: _ph, ...u }) => u));
  } catch (e) {
    return fail(e);
  }
});

export const POST = withRole(['admin'], async (req: NextRequest) => {
  try {
    const body = await readJson<{ name: string; email: string; role: Role; password: string }>(req);
    const user = await createUser(body);
    const { password_hash: _ph, ...safe } = user;
    return created(safe);
  } catch (e) {
    return fail(e);
  }
});
