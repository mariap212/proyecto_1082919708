import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { JWTPayload } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
);

const COOKIE_NAME = 'ovogest_session';
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 horas

export interface AuthSession {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'vendedor' | 'bodeguero' | 'conductor';
  iat?: number;
  exp?: number;
}

/**
 * Crea un token JWT con la información del usuario
 */
export async function createJWT(session: AuthSession): Promise<string> {
  return await new SignJWT(session as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

/**
 * Verifica y decodifica un token JWT
 */
export async function verifyJWT(token: string): Promise<AuthSession | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as AuthSession;
  } catch (err) {
    return null;
  }
}

/**
 * Establece la cookie de sesión HttpOnly
 */
export async function setAuthCookie(session: AuthSession): Promise<void> {
  const token = await createJWT(session);
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Obtiene la sesión actual desde la cookie
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyJWT(token);
}

/**
 * Elimina la cookie de sesión
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Hash simple para desarrollo (reemplazar con bcryptjs en producción)
 * En producción: import bcrypt from 'bcryptjs'
 */
export async function hashPassword(password: string): Promise<string> {
  // Placeholder: en producción usar bcryptjs
  // const salt = await bcrypt.genSalt(10);
  // return bcrypt.hash(password, salt);
  
  // Para desarrollo, usar crypto builtin
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compara contraseña con hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Placeholder: en producción usar bcryptjs
  // return bcrypt.compare(password, hash);
  
  // Para desarrollo, comparar SHA-256
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Roles por jerarquía - para validaciones
 */
export const ROLE_HIERARCHY: Record<string, number> = {
  admin: 4,
  vendedor: 3,
  bodeguero: 2,
  conductor: 1,
};

/**
 * Valida si un rol tiene permiso para una acción
 */
export function hasPermission(userRole: string, requiredRole: string): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}
