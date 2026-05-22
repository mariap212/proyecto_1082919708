# 🔐 Sistema de Autenticación OvoGest

## Descripción General

Sistema de autenticación basado en JWT con cookies HttpOnly para OvoGest. Actualmente en modo **seed** (solo lectura de datos estáticos desde `data/users.json`).

## Características Implementadas

- ✅ Autenticación con JWT (librería `jose`)
- ✅ Cookies HttpOnly seguras (no accesibles desde JavaScript)
- ✅ Endpoints de API para login/logout/me/change-password
- ✅ Validación de roles (admin, vendedor, bodeguero, conductor)
- ✅ Datos de usuario en `data/users.json` (seed mode)
- ✅ Página de login con diseño especificado (ámbar/slate, SVG de cartón)
- ✅ Dashboard de bienvenida por rol

## Estructura de Archivos

```
lib/
├── auth.ts                          # Funciones de JWT, cookies, hash
└── data-service.ts                  # Lectura de usuarios desde seed

app/
├── page.tsx                         # Redirige a /dashboard o /login
├── login/
│   └── page.tsx                     # Página de login
├── dashboard/
│   └── page.tsx                     # Dashboard principal (protegido)
└── api/auth/
    ├── login/route.ts               # POST /api/auth/login
    ├── logout/route.ts              # POST /api/auth/logout
    ├── me/route.ts                  # GET /api/auth/me
    └── change-password/route.ts      # POST /api/auth/change-password

components/auth/
└── LoginForm.tsx                    # Componente formulario de login

data/
└── users.json                       # Datos de usuarios (seed)
```

## Credenciales de Prueba

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@ovogest.local` | `password123` |
| Vendedor | `vendedor@ovogest.local` | `password123` |
| Bodeguero | `bodeguero@ovogest.local` | `password123` |
| Conductor | `conductor@ovogest.local` | `password123` |

**Nota:** El seed incluye contraseñas idénticas para desarrollo. En producción, cada usuario tendrá contraseña única hasheada con bcryptjs.

## Flujo de Autenticación

### 1. Login

```
Usuario → /login
       ↓
LoginForm: email + password
       ↓
POST /api/auth/login
       ↓
Validar en data/users.json
       ↓
Generar JWT con jose
       ↓
Guardar en cookie HttpOnly
       ↓
Redirigir a /dashboard
```

### 2. Solicitudes Autenticadas

```
Browser (con cookie)
       ↓
GET /dashboard (o cualquier ruta protegida)
       ↓
getAuthSession() → lee cookie → verifica JWT
       ↓
Si válido: renderizar contenido
Si inválido: redirigir a /login
```

### 3. Logout

```
Usuario → Botón "Cerrar sesión"
       ↓
POST /api/auth/logout
       ↓
clearAuthCookie()
       ↓
Eliminar cookie
       ↓
Redirigir a /login
```

## Funciones Principales

### `auth.ts`

#### `createJWT(session: AuthSession): Promise<string>`
- Crea un token JWT con información del usuario
- Válido por 24 horas
- Algoritmo: HS256

#### `verifyJWT(token: string): Promise<AuthSession | null>`
- Verifica y decodifica un token JWT
- Retorna null si es inválido/expirado

#### `setAuthCookie(session: AuthSession): Promise<void>`
- Guarda el token en una cookie HttpOnly
- Segura (HTTPS en producción)
- SameSite=lax
- Válida por 24 horas

#### `getAuthSession(): Promise<AuthSession | null>`
- Lee la sesión actual desde la cookie
- Verifica validez del token
- Retorna null si no hay sesión

#### `clearAuthCookie(): Promise<void>`
- Elimina la cookie de sesión

#### `hashPassword(password: string): Promise<string>`
- En desarrollo: SHA-256
- En producción: usar bcryptjs

#### `verifyPassword(password: string, hash: string): Promise<boolean>`
- Compara contraseña con hash

### `data-service.ts`

#### `readUsersFromSeed(): Promise<User[]>`
- Lee todos los usuarios desde `data/users.json`

#### `findUserByEmail(email: string): Promise<User | null>`
- Busca usuario por email (case-insensitive)

#### `findUserById(id: string): Promise<User | null>`
- Busca usuario por ID

#### `isSeedMode(): boolean`
- Retorna true si está en modo seed (no hay Supabase)

## Protección de Rutas

### Componentes Servidor (RSC)

```typescript
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await getAuthSession();
  
  if (!session) {
    redirect('/login');
  }

  return <div>Contenido protegido</div>;
}
```

### Componentes Cliente

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedComponent() {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setSession(data.user);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, []);

  if (!session) return <div>Cargando...</div>;
  
  return <div>Contenido protegido para {session.email}</div>;
}
```

## Interfaz AuthSession

```typescript
interface AuthSession {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'vendedor' | 'bodeguero' | 'conductor';
  iat?: number;      // Issued at (timestamp)
  exp?: number;      // Expiration (timestamp)
}
```

## Interfaz User (Seed)

```typescript
interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'vendedor' | 'bodeguero' | 'conductor';
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;          // ISO 8601
  updated_at: string;          // ISO 8601
  last_login_at: string | null; // ISO 8601
}
```

## Roles y Permisos

### Jerarquía de Roles

```
admin (4)        → Acceso total
├─ vendedor (3)  → Gestión de pedidos y clientes
├─ bodeguero (2) → Gestión de inventario
└─ conductor (1) → Visualización y actualización de entregas
```

### Función de Validación

```typescript
import { hasPermission } from '@/lib/auth';

const userRole = 'vendedor';
const requiredRole = 'admin';

if (hasPermission(userRole, requiredRole)) {
  // Permitir acción
} else {
  // Denegar acceso
}
```

## Variables de Entorno

```bash
# .env.local

# JWT Secret para firmar tokens (mínimo 32 caracteres en producción)
JWT_SECRET="dev-secret-key-change-in-production"

# Para modo live (Supabase)
NEXT_PUBLIC_SUPABASE_OVODIST_SUPABASE_PUBLISHABLE_KEY="..."
SUPABASE_OVODIST_SUPABASE_URL="..."
# ... (otros vars Supabase)

# App URL (para redirecciones)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Próximos Pasos

### Fase 2: Integración con Supabase

1. Crear tabla `users` en PostgreSQL
2. Reemplazar `data-service.ts` con Supabase client
3. Implementar bcryptjs para hash de contraseñas
4. Agregar función de registro (si aplica)
5. Sistema de reseteo de contraseña

### Fase 3: Seguridad Avanzada

1. Rate limiting en login
2. CSRF tokens
3. 2FA (Two-Factor Authentication)
4. Auditoría de login en Vercel Blob
5. Session timeout

## Pruebas

### Login exitoso
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ovogest.local","password":"password123"}'
```

### Obtener usuario actual
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b "ovogest_session=<token>"
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b "ovogest_session=<token>"
```

## Troubleshooting

### "Error de conexión" al hacer login

- Verificar que el servidor está corriendo (`npm run dev`)
- Revisar la consola del navegador (DevTools → Network)
- Verificar que `data/users.json` existe y es válido

### No se establece la cookie

- Verificar que `getAuthSession()` se usa en componente servidor (RSC)
- Revisar que la cookie no está siendo bloqueada por opciones de navegador

### JWT expirado

- Las sesiones duran 24 horas
- El usuario debe hacer login nuevamente

## Dependencias Requeridas

```json
{
  "jose": "^5.x",
  "bcryptjs": "^2.4.3"  // Para producción
}
```

Instalar con:
```bash
npm install jose
npm install bcryptjs --save-dev  // Opcional para desarrollo
```

---

**Última actualización:** 4 de mayo de 2026  
**Status:** Seed Mode Activo  
**Próxima fase:** Integración con Supabase PostgreSQL
