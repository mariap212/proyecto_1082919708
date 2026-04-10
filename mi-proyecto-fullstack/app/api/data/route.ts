import { NextResponse } from 'next/server';
import { readJsonFileValidated } from '@/lib/data/reader';
import { HomePageDataSchema } from '@/lib/data/schemas';

export async function GET(): Promise<NextResponse> {
  const result = readJsonFileValidated('pages/home.json', HomePageDataSchema);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json(result.data);
}