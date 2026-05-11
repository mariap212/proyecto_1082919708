import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        user: session,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
