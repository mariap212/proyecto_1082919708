import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { AppShell } from '@/components/layout/AppShell';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  if (!session) redirect('/login');

  return (
    <AppShell
      user={{
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role,
      }}
    >
      {children}
    </AppShell>
  );
}
