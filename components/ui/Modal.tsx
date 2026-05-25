'use client';

import React, { useEffect } from 'react';
import { Eyebrow } from './primitives';

export function Modal({
  title,
  eyebrow,
  onClose,
  children,
  size = 'md',
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-slate-950/85 backdrop-blur-md animate-rise"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${widths[size]} animate-rise`}
      >
        <div className="panel !p-8 relative overflow-visible">
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 w-8 h-8 grid place-items-center text-slate-500 hover:text-slate-200 transition-colors rounded-md hover:bg-white/[0.04]"
          >
            ✕
          </button>

          <div className="mb-6 pr-10">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h2 className="heading-serif text-2xl text-slate-50 mt-2">{title}</h2>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
