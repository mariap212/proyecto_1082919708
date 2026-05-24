'use client';

import Link from 'next/link';
import React from 'react';

interface TopNavProps {
  active?: 'login' | 'dashboard' | 'setup' | string;
}

export default function TopNav({ active }: TopNavProps): React.JSX.Element {
  const links = [
    { href: '/login', label: 'Login', key: 'login' },
    { href: '/dashboard', label: 'Dashboard', key: 'dashboard' },
    { href: '/setup', label: 'Setup', key: 'setup' },
  ];

  return (
    <nav className="relative z-20 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-slate-950/75 px-4 py-3 text-sm text-slate-200 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
      <Link href="/" className="font-semibold tracking-wide text-white transition hover:text-amber-200">
        OvoGest
      </Link>
      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={`rounded-full px-4 py-2 transition ${
              active === link.key
                ? 'bg-amber-500/15 text-amber-200'
                : 'border border-white/10 bg-white/5 text-slate-200 hover:border-amber-300/20 hover:bg-white/10 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
