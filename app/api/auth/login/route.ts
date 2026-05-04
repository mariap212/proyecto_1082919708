import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookie, verifyPassword } from '@/lib/auth';
import { findUserByEmail } from '@/lib/data-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario en seed
    const user = await findUserByEmail(email);

    if (!user || !user.is_active) {
      // No revelar si el usuario existe por seguridad
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    // Nota: en desarrollo, la contraseña hash es SHA-256 del password
    // Las contraseñas por defecto en seed son todas iguales
    const passwordValid = await verifyPassword(password, user.password_hash);

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Crear sesión
    const session = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    await setAuthCookie(session);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          must_change_password: user.must_change_password,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
