import type { Metadata } from 'next';
import React from 'react';
import { readJsonFileValidated } from '@/lib/data/reader';
import { HomePageDataSchema } from '@/lib/data/schemas';
import HolaMundo from '@/components/ui/HolaMundo';
import PageWrapper from '@/components/layout/PageWrapper';

const homeResult = readJsonFileValidated('pages/home.json', HomePageDataSchema);

if (!homeResult.success) {
  throw new Error(`Error cargando datos del home: ${homeResult.error}`);
}

const homeData = homeResult.data;

export const metadata: Metadata = {
  title: homeData.meta.title,
  description: homeData.meta.description,
};

export default function HomePage(): React.JSX.Element {
  return (
    <PageWrapper>
      <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-slate-900 to-black">
        <HolaMundo data={homeData.hero} />
      </main>
    </PageWrapper>
  );
}
