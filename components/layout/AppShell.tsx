'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api-client';
import type { Role } from '@/lib/types';

interface UserBrief {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface NavItem {
  href: string;
  label: string;
  roles: Role[];
  group?: 'core' | 'catalog' | 'ops' | 'admin';
}

const NAV: NavItem[] = [
  { href: '/dashboard',            label: 'Resumen',     roles: ['admin', 'vendedor', 'bodeguero', 'conductor'], group: 'core' },
  { href: '/inventario',           label: 'Inventario',  roles: ['admin', 'vendedor', 'bodeguero'], group: 'core' },

  { href: '/catalogo/productos',   label: 'Productos',   roles: ['admin', 'vendedor', 'bodeguero'], group: 'catalog' },
  { href: '/catalogo/proveedores', label: 'Proveedores', roles: ['admin', 'bodeguero'], group: 'catalog' },
  { href: '/catalogo/clientes',    label: 'Clientes',    roles: ['admin', 'vendedor'], group: 'catalog' },

  { href: '/pedidos',              label: 'Pedidos',     roles: ['admin', 'vendedor', 'bodeguero'], group: 'ops' },
  { href: '/entregas',             label: 'Entregas',    roles: ['admin', 'vendedor', 'bodeguero', 'conductor'], group: 'ops' },
  { href: '/facturas',             label: 'Facturas',    roles: ['admin', 'vendedor'], group: 'ops' },
  { href: '/reportes',             label: 'Reportes',    roles: ['admin', 'bodeguero'], group: 'ops' },

  { href: '/admin/usuarios',       label: 'Usuarios',    roles: ['admin'], group: 'admin' },
  { href: '/admin/auditoria',      label: 'Auditoría',   roles: ['admin'], group: 'admin' },
];

const GROUP_LABELS: Record<string, string> = {
  core: 'Operación',
  catalog: 'Catálogo',
  ops: 'Comercial',
  admin: 'Administración',
};

export function AppShell({ user, children }: { user: UserBrief; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    try {
      await apiPost('/api/auth/logout');
    } finally {
      router.replace('/login');
    }
  }

  const visible = NAV.filter((i) => i.roles.includes(user.role));
  const grouped: Record<string, NavItem[]> = {};
  for (const it of visible) {
    const g = it.group ?? 'core';
    (grouped[g] ??= []).push(it);
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 shrink-0 border-r border-white/[0.06] bg-slate-950/80 backdrop-blur-md flex flex-col sticky top-0 h-screen">
        {/* Brand */}
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 grid place-items-center text-amber-950 font-serif italic text-lg">
                o
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-300 animate-pulse-dot" />
            </div>
            <div>
              <div className="heading-serif text-lg text-white leading-none">OvoGest</div>
              <div className="eyebrow mt-1.5">Distribución mayorista</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {Object.entries(grouped).map(([groupKey, items]) => (
            <div key={groupKey}>
              <div className="px-3 mb-2 eyebrow">{GROUP_LABELS[groupKey] ?? groupKey}</div>
              <ul className="space-y-px">
                {items.map((it, idx) => {
                  const active = pathname === it.href || pathname.startsWith(it.href + '/');
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                          active
                            ? 'bg-white/[0.04] text-amber-200'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.02]'
                        }`}
                      >
                        <span
                          className={`mono text-[0.625rem] tabular-nums transition-colors ${
                            active ? 'text-amber-400' : 'text-slate-600 group-hover:text-slate-500'
                          }`}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1">{it.label}</span>
                        {active && (
                          <span className="w-1 h-4 bg-amber-400 rounded-full" aria-hidden />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 grid place-items-center text-xs font-medium text-slate-300 ring-1 ring-white/10">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-200 truncate">{user.name}</div>
              <div className="eyebrow !text-[0.55rem] mt-0.5">{user.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-left text-xs text-slate-500 hover:text-amber-300 transition-colors px-2 py-1.5 rounded-md hover:bg-white/[0.02]"
          >
            ↳ Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden relative">
        {/* Subtle vignette */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(circle at 0% 0%, rgba(245,158,11,0.04), transparent 30%), radial-gradient(circle at 100% 100%, rgba(56,189,248,0.03), transparent 35%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1240px] px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
