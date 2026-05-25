'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api-client';
import type { Role } from '@/lib/types';

interface Me {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: Role[];
}

const NAV: NavItem[] = [
  { href: '/dashboard',            label: 'Dashboard',   icon: '⊞', roles: ['admin', 'vendedor', 'bodeguero', 'conductor'] },
  { href: '/inventario',           label: 'Inventario',  icon: '📦', roles: ['admin', 'vendedor', 'bodeguero'] },
  { href: '/catalogo/productos',   label: 'Productos',   icon: '🥚', roles: ['admin', 'vendedor', 'bodeguero'] },
  { href: '/catalogo/proveedores', label: 'Proveedores', icon: '🚜', roles: ['admin', 'bodeguero'] },
  { href: '/catalogo/clientes',    label: 'Clientes',    icon: '👥', roles: ['admin', 'vendedor'] },
  { href: '/pedidos',              label: 'Pedidos',     icon: '🧾', roles: ['admin', 'vendedor', 'bodeguero'] },
  { href: '/entregas',             label: 'Entregas',    icon: '🚚', roles: ['admin', 'vendedor', 'bodeguero', 'conductor'] },
  { href: '/facturas',             label: 'Facturas',    icon: '🧮', roles: ['admin', 'vendedor'] },
  { href: '/reportes',             label: 'Reportes',    icon: '📊', roles: ['admin', 'bodeguero'] },
  { href: '/admin/usuarios',       label: 'Usuarios',    icon: '⚙️', roles: ['admin'] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Me>('/api/auth/me')
      .then(setMe)
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    try {
      await apiPost('/api/auth/logout');
    } finally {
      router.replace('/login');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Cargando…
      </div>
    );
  }
  if (!me) return null;

  const items = NAV.filter((i) => i.roles.includes(me.role));

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-white/5 bg-slate-950/60 backdrop-blur-md flex flex-col">
        <div className="p-5 border-b border-white/5">
          <div className="text-amber-300 font-semibold text-lg">OvoGest</div>
          <div className="text-xs text-slate-400 mt-1">Distribución de huevos</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + '/');
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? 'bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/30' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <span className="text-base">{it.icon}</span>
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/5">
          <div className="text-xs text-slate-400 px-2 mb-2">{me.name}</div>
          <div className="text-xs text-amber-300/80 px-2 mb-2 capitalize">{me.role}</div>
          <button
            onClick={logout}
            className="w-full text-left text-sm text-slate-300 hover:text-amber-200 rounded-md px-3 py-2 hover:bg-white/5"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
