import type { Metadata } from 'next';
import React from 'react';
import { Geist, Geist_Mono, Fraunces } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
});

export const metadata: Metadata = {
  title: {
    template: '%s · OvoGest',
    default: 'OvoGest · Distribución mayorista',
  },
  description: 'Sistema de distribución mayorista de huevos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
