# 🚨 PERSISTENCIA DE DATOS — REGLAS PARA VERCEL

> **Documento obligatorio. Léelo antes de tocar nada que escriba datos.**

---

## 1. La regla de oro

> **En Vercel el filesystem es de solo lectura.**
> Cualquier `fs.writeFile`, `fs.mkdir`, `fs.appendFile`, `fs.rename`, `fs.unlink`
> (o equivalente) en runtime ROMPE en producción.

El bundle de la función se monta en `/var/task` como **read-only**. Solo `/tmp`
es escribible, pero:

- es **efímero** (se borra cuando termina la invocación),
- **no se comparte** entre invocaciones ni entre instancias,
- **no sobrevive** a un redeploy,
- **no es una base de datos**.

→ **Todo dato que necesite persistir DEBE guardarse en Supabase (PostgreSQL).**

---

## 2. Qué SÍ se puede hacer

| Operación | ¿Dónde? | Notas |
|---|---|---|
| Leer JSON empaquetado en el bundle | `fs.readFile('data/*.json')` | OK — es read-only y va con el deploy |
| Cache temporal en memoria | módulo-level `let cache = ...` | Por instancia, se pierde al apagarse |
| Cache compartido | Supabase, Redis (Upstash), Vercel Blob | Persistente |
| Leer assets estáticos | `public/` | Servidos por el CDN |
| Subir archivos | Vercel Blob, Supabase Storage, S3 | NO al filesystem |

---

## 3. Qué NO se puede hacer

| Anti-patrón | Por qué falla | Reemplazo |
|---|---|---|
| `fs.writeFile('data/users.json', ...)` | Filesystem read-only | `supabase.from('users').insert(...)` |
| `fs.mkdir('data/', ...)` | Filesystem read-only | No hace falta — usar tablas |
| Logs en archivo (`fs.appendFile`) | Filesystem read-only | `console.log` (Vercel los captura) |
| Sesiones en disco | Filesystem read-only | Cookie firmada + Supabase |
| Subir avatares al disco del proyecto | Filesystem read-only | Vercel Blob / Supabase Storage |
| “Inicializar” seed en runtime escribiendo archivos | Filesystem read-only | Migraciones SQL en Supabase con `executeSql()` |

---

## 4. Estado actual del proyecto

### ❗ Endpoint legacy con escritura a disco

[`app/api/setup-database/route.ts`](../app/api/setup-database/route.ts) hace `fs.writeFile` sobre
`data/*.json` para inicializar el seed. **Esto funciona en local pero FALLA en Vercel.**

→ Hay que reemplazarlo por un setup que ejecute migraciones SQL contra Supabase
usando `executeSql()` de [`lib/supabase.ts`](../lib/supabase.ts) y luego `INSERT`s
con el cliente de Supabase. Esta tarea está **pendiente**.

### ✅ Lectura del seed (compatible)

[`lib/data-service.ts`](../lib/data-service.ts) lee `data/*.json` con `fs.readFile`
**solo como fallback** cuando Supabase aún no tiene las tablas creadas. Esto es
seguro en Vercel porque los JSON se empaquetan con el deploy y se leen, no se
escriben.

---

## 5. Variables de entorno — **nombres EXACTOS**

> ⚠ **NO renombrar.** Estos nombres deben coincidir 1:1 con los que la integración
> OVODIST inyecta automáticamente en Vercel. Si cambias el nombre en local, en
> producción no se encontrará la variable y el cliente Supabase retornará `null`.

### Backend (server-only, NUNCA exponer al cliente)

| Variable | Uso |
|---|---|
| `SUPABASE_OVODIST_SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_OVODIST_SUPABASE_SERVICE_ROLE_KEY` | Llave service_role (salta RLS) |
| `SUPABASE_OVODIST_SUPABASE_SECRET_KEY` | Llave secret (sb_secret_...) |
| `SUPABASE_OVODIST_SUPABASE_ANON_KEY` | Llave anon (JWT) |
| `SUPABASE_OVODIST_SUPABASE_JWT_SECRET` | Para verificar JWTs de Supabase Auth |
| `SUPABASE_OVODIST_POSTGRES_URL` | Conexión PG vía pooler (transacciones cortas) |
| `SUPABASE_OVODIST_POSTGRES_URL_NON_POOLING` | PG directo — **usar para DDL** |
| `SUPABASE_OVODIST_POSTGRES_PRISMA_URL` | Si usas Prisma |
| `SUPABASE_OVODIST_POSTGRES_HOST` | host |
| `SUPABASE_OVODIST_POSTGRES_DATABASE` | nombre BD |
| `SUPABASE_OVODIST_POSTGRES_USER` | usuario |
| `SUPABASE_OVODIST_POSTGRES_PASSWORD` | password |

### Frontend (cliente browser)

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_OVODIST_SUPABASE_PUBLISHABLE_KEY` | Llave publishable (sb_publishable_...) |

> El prefijo `NEXT_PUBLIC_` es obligatorio en Next.js para que la variable se
> incluya en el bundle del navegador.

### Sesiones de la app (no Supabase)

| Variable | Uso |
|---|---|
| `JWT_SECRET` | Firma de cookies `ovogest_session` con `jose` |

---

## 6. Cómo se leen las variables en el código

Ver [`lib/supabase.ts`](../lib/supabase.ts):

```ts
const url = readEnv('SUPABASE_OVODIST_SUPABASE_URL');
const key = readEnv('SUPABASE_OVODIST_SUPABASE_SERVICE_ROLE_KEY')
         ?? readEnv('SUPABASE_OVODIST_SUPABASE_SECRET_KEY');
```

**Cliente build-safe**: si las variables no existen (build sin env vars),
`getSupabaseClient()` retorna `null` en lugar de lanzar. Esto deja a `next build`
pre-renderizar sin fallar.

---

## 7. Setup de Vercel (paso a paso)

1. **Conectar integración Supabase OVODIST**
   `Vercel → Project → Integrations → Supabase → Connect → seleccionar proyecto OVODIST`
   → Esto crea TODAS las variables `SUPABASE_OVODIST_*` automáticamente.

2. **Agregar manualmente `JWT_SECRET`**
   `Settings → Environment Variables → Add`
   Mismo valor que `SUPABASE_OVODIST_SUPABASE_JWT_SECRET` está bien, o uno propio.

3. **Verificar nombres**
   `Settings → Environment Variables` — confirmar que existen todas las listadas
   en la sección 5 con esos nombres exactos.

4. **Deploy**
   No se necesita configuración extra. La app detecta Supabase por las env vars.

---

## 8. Checklist antes de hacer push

- [ ] No hay `fs.writeFile` / `fs.mkdir` / `fs.appendFile` en código que corre en runtime
- [ ] Todas las escrituras pasan por `getSupabaseClient()` → `.insert / .update / .delete`
- [ ] DDL (CREATE TABLE / ALTER) usa `executeSql()` desde [`lib/supabase.ts`](../lib/supabase.ts), no `fs.writeFile`
- [ ] Páginas que leen datos tienen `export const dynamic = 'force-dynamic'` (o son Server Actions / Route Handlers)
- [ ] Ningún módulo conecta a Supabase a nivel top-level (solo dentro de funciones async)
- [ ] `npx tsc --noEmit` y `npx next build` pasan en local
- [ ] Las env vars en Vercel usan los nombres EXACTOS de la sección 5

---

## 9. Errores típicos y diagnóstico

| Error en runtime de Vercel | Causa | Fix |
|---|---|---|
| `EROFS: read-only file system` | Intentaste escribir al disco | Migrar a Supabase |
| `Supabase no configurado — retornando null` en logs | Falta env var | Verificar nombres en Vercel |
| `Could not find the table 'public.X' in the schema cache` | Tabla no existe en Supabase | Ejecutar migración SQL |
| `JWT verification failed` | `JWT_SECRET` local ≠ Vercel | Sincronizar el secret |
| Tabla creada pero PostgREST no la ve | Schema cache obsoleto | `NOTIFY pgrst, 'reload schema';` al final del DDL |

---

## 10. TL;DR

1. **Disco = ❌ en Vercel.** Todo dato persistente → Supabase.
2. **Las variables OVODIST llevan ese nombre exacto.** No renombrar.
3. **`fs.readFile` está OK** (lectura del bundle). **`fs.writeFile` rompe.**
4. **`executeSql()`** para DDL, **`getSupabaseClient()`** para CRUD.
