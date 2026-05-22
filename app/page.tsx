import type { Metadata } from 'next';
import React from 'react';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'OvoGest | Gestión de distribución mayorista',
  description: 'Sistema de gestión para distribuidoras mayoristas de huevos',
};

export default async function HomePage(): Promise<React.JSX.Element> {
  const session = await getAuthSession();

  // Redirigir según estado de autenticación
  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
