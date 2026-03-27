# Plan de Implementación por Fases
## Sistema Fullstack TypeScript — GitHub + Vercel + JSON Data Layer

> **Tipo:** Plan de ejecución técnica  
> **Versión:** 1.0.0  
> **Referencia:** Plan de Infraestructura Fullstack TypeScript v1.0.0  
> **Fecha:** Marzo 2026

---

## Resumen Ejecutivo

Este documento define la hoja de ruta de implementación dividida en **5 fases progresivas**, cada una con entregables concretos, criterios de aceptación verificables y estimaciones de tiempo. Cada fase es independiente y funcional por sí sola, permitiendo validar el sistema antes de avanzar a la siguiente etapa.

```
FASE 1          FASE 2          FASE 3          FASE 4          FASE 5
Setup &    ──►  Data Layer  ──►  UI & Home  ──►  CI/CD &    ──►  Validación
Estructura      JSON DB         Animado         Deploy          & Cierre
  2-3h           2-3h            3-4h            1-2h            1h
```

**Tiempo total estimado:** 9 — 13 horas de implementación

---

## Índice de Fases

| Fase | Nombre | Duración | Estado |
|------|--------|----------|--------|
| [Fase 1](#fase-1--setup-y-estructura-base) | Setup y Estructura Base | 2–3h | 🔲 Pendiente |
| [Fase 2](#fase-2--capa-de-datos-json) | Capa de Datos JSON | 2–3h | 🔲 Pendiente |
| [Fase 3](#fase-3--ui-home-con-efecto-elegante) | UI — Home con Efecto Elegante | 3–4h | 🔲 Pendiente |
| [Fase 4](#fase-4--cicd-github--vercel) | CI/CD GitHub + Vercel | 1–2h | 🔲 Pendiente |
| [Fase 5](#fase-5--validación-final-y-cierre) | Validación Final y Cierre | 1h | 🔲 Pendiente |

---

## FASE 1 — Setup y Estructura Base

> **Duración estimada:** 2–3 horas  
> **Objetivo:** Tener el proyecto TypeScript inicializado, configurado con máxima rigurosidad de tipos y subido al repositorio GitHub.

### 1.1 Creación del Repositorio GitHub

**Pasos:**

1. Ir a [github.com/new](https://github.com/new)
2. Configurar el repositorio:
   - **Nombre:** `mi-proyecto-fullstack` (o el nombre elegido)
   - **Visibilidad:** Privado o Público según preferencia
   - **Inicializar con:** `README.md`
   - **`.gitignore`:** Node
   - **Licencia:** MIT (opcional)
3. Copiar la URL del repositorio

**Resultado esperado:** Repositorio vacío disponible en GitHub.

---

### 1.2 Inicialización del Proyecto Next.js + TypeScript

Ejecutar en la terminal local:

```bash
npx create-next-app@latest mi-proyecto-fullstack \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd mi-proyecto-fullstack
```

**Selecciones en el asistente interactivo:**

| Pregunta | Respuesta |
|----------|-----------|
| Would you like to use TypeScript? | **Yes** |
| Would you like to use ESLint? | **Yes** |
| Would you like to use Tailwind CSS? | **Yes** |
| Would you like to use `src/` directory? | **No** |
| Would you like to use App Router? | **Yes** |
| Would you like to customize the import alias? | **Yes → `@/*`** |

---

### 1.3 Instalación de Dependencias Adicionales

```bash
# Animaciones elegantes con soporte TypeScript nativo
npm install framer-motion

# Utilidad para manejo de clases CSS condicionales
npm install clsx tailwind-merge

# Validación de esquemas (preparación para Fase 2)
npm install zod
```

---

### 1.4 Configuración TypeScript Estricta

Reemplazar el contenido de `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"],
      "@/data/*": ["./data/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### 1.5 Configuración de ESLint y Prettier

Crear `.eslintrc.json`:

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

Crear `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100
}
```

Agregar scripts en `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "validate": "npm run type-check && npm run lint"
  }
}
```

---

### 1.6 Crear la Estructura de Carpetas

```bash
# Carpetas principales
mkdir -p data/pages
mkdir -p components/ui
mkdir -p components/layout
mkdir -p lib/data
mkdir -p lib/utils
mkdir -p types

# Archivo de tipos globales
touch types/index.ts

# Archivo de utilidades CSS
touch lib/utils/cn.ts
```

Contenido de `lib/utils/cn.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

---

### 1.7 Conectar con GitHub

```bash
git init
git remote add origin https://github.com/TU_USUARIO/mi-proyecto-fullstack.git
git add .
git commit -m "feat: initial project setup — Next.js 14 + TypeScript strict + Tailwind"
git branch -M main
git push -u origin main
```

---

### ✅ Criterios de Aceptación — Fase 1

- [ ] Proyecto creado con `create-next-app` sin errores
- [ ] `npm run dev` levanta el servidor en `localhost:3000`
- [ ] `npm run type-check` retorna **0 errores**
- [ ] `npm run lint` retorna **0 warnings**
- [ ] Estructura de carpetas creada correctamente
- [ ] Primer commit visible en GitHub
- [ ] `strict: true` activo en `tsconfig.json`

---

## FASE 2 — Capa de Datos JSON

> **Duración estimada:** 2–3 horas  
> **Objetivo:** Implementar el sistema de persistencia basado en archivos JSON con tipado TypeScript completo, incluyendo validación de esquemas con Zod.

### 2.1 Crear los Archivos JSON Base

**`data/config.json`**

```json
{
  "app": {
    "name": "Mi App Fullstack",
    "version": "1.0.0",
    "language": "es",
    "author": "Tu Nombre"
  },
  "theme": {
    "primaryColor": "#0f172a",
    "accentColor": "#6366f1",
    "mode": "dark"
  }
}
```

**`data/pages/home.json`**

```json
{
  "hero": {
    "greeting": "Hola Mundo",
    "subtitle": "TypeScript · Next.js · Vercel",
    "description": "Sistema fullstack con tipado estricto y datos JSON funcionando correctamente.",
    "badge": "TypeScript · OK"
  },
  "meta": {
    "title": "Home | Mi App Fullstack",
    "description": "Página principal del sistema fullstack TypeScript"
  }
}
```

**`data/README.md`**

```markdown
# Carpeta de Datos — JSON Database

Esta carpeta actúa como capa de persistencia basada en archivos JSON.

## Convenciones

- Un archivo JSON por entidad o sección de la aplicación
- Estructura plana y predecible
- Tipos TypeScript definidos en `lib/data/types.ts`
- Validación de esquemas con Zod en `lib/data/schemas.ts`

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `config.json` | Configuración global de la app |
| `pages/home.json` | Contenido de la página principal |

## Nota de Producción

En Vercel (entorno serverless), estos archivos son de **solo lectura**.
Para escritura en producción, migrar a Vercel KV en Fase futura.
```

---

### 2.2 Definir los Tipos TypeScript

Crear `lib/data/types.ts`:

```typescript
// ─── Configuración Global ───────────────────────────────────────────────────

export interface AppConfig {
  app: {
    name: string;
    version: string;
    language: string;
    author: string;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    mode: 'light' | 'dark' | 'system';
  };
}

// ─── Página Home ─────────────────────────────────────────────────────────────

export interface HeroSection {
  greeting: string;
  subtitle: string;
  description: string;
  badge: string;
}

export interface PageMeta {
  title: string;
  description: string;
}

export interface HomePageData {
  hero: HeroSection;
  meta: PageMeta;
}

// ─── Tipos Utilitarios ────────────────────────────────────────────────────────

export type DataReadResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
```

---

### 2.3 Definir Esquemas de Validación con Zod

Crear `lib/data/schemas.ts`:

```typescript
import { z } from 'zod';

export const AppConfigSchema = z.object({
  app: z.object({
    name: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    language: z.string().length(2),
    author: z.string().min(1),
  }),
  theme: z.object({
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    mode: z.enum(['light', 'dark', 'system']),
  }),
});

export const HeroSectionSchema = z.object({
  greeting: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  badge: z.string().min(1),
});

export const HomePageDataSchema = z.object({
  hero: HeroSectionSchema,
  meta: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
});
```

---

### 2.4 Implementar la Utilidad de Lectura

Crear `lib/data/reader.ts`:

```typescript
import fs from 'fs';
import path from 'path';
import { ZodSchema } from 'zod';
import type { DataReadResult } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Lee un archivo JSON desde la carpeta data/ y lo retorna tipado.
 * Lanza un error si el archivo no existe o el JSON es inválido.
 */
export function readJsonFile<T>(filePath: string): T {
  const fullPath = path.join(DATA_DIR, filePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Archivo de datos no encontrado: ${filePath}`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');

  try {
    return JSON.parse(fileContents) as T;
  } catch {
    throw new Error(`Error al parsear JSON en: ${filePath}`);
  }
}

/**
 * Lee un archivo JSON y lo valida contra un esquema Zod.
 * Retorna un resultado discriminado (success/error) sin lanzar excepciones.
 */
export function readJsonFileValidated<T>(
  filePath: string,
  schema: ZodSchema<T>
): DataReadResult<T> {
  try {
    const raw = readJsonFile<unknown>(filePath);
    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(', '),
      };
    }

    return { success: true, data: parsed.data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    };
  }
}
```

---

### 2.5 Crear la API Route de Datos

Crear `app/api/data/route.ts`:

```typescript
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
```

---

### 2.6 Verificar la Capa de Datos

```bash
# Verificar tipos
npm run type-check

# Levantar servidor y probar el endpoint
npm run dev

# En otro terminal o en el navegador:
# GET http://localhost:3000/api/data
# Debe retornar el JSON de home.json correctamente tipado
```

---

### ✅ Criterios de Aceptación — Fase 2

- [ ] Archivos `data/config.json` y `data/pages/home.json` creados y válidos
- [ ] Tipos TypeScript en `lib/data/types.ts` sin errores
- [ ] Esquemas Zod en `lib/data/schemas.ts` compilando correctamente
- [ ] `lib/data/reader.ts` funcional con genéricos TypeScript
- [ ] `GET /api/data` retorna `200` con el JSON tipado
- [ ] `npm run type-check` retorna **0 errores**
- [ ] Commit: `feat: JSON data layer with TypeScript types and Zod validation`

---

## FASE 3 — UI — Home con Efecto Elegante

> **Duración estimada:** 3–4 horas  
> **Objetivo:** Implementar la página Home con "Hola Mundo" centrado y un efecto visual de nivel producción usando Framer Motion y Tailwind CSS.

### 3.1 Configurar Tailwind CSS

Actualizar `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### 3.2 Estilos Globales

Actualizar `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #020617;
  --color-primary: #6366f1;
  --color-accent: #818cf8;
  --color-text: #f1f5f9;
  --color-muted: #64748b;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  background-color: var(--color-bg);
  color: var(--color-text);
}

/* Cursor personalizado */
body {
  cursor: crosshair;
}

/* Scrollbar elegante */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 2px;
}
```

---

### 3.3 Layout Principal

Actualizar `app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Mi App Fullstack',
    default: 'Mi App Fullstack',
  },
  description: 'Sistema fullstack TypeScript con Next.js y Vercel',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="es" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

---

### 3.4 Componente PageWrapper con Animación de Entrada

Crear `components/layout/PageWrapper.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

---

### 3.5 Componente Principal HolaMundo

Crear `components/ui/HolaMundo.tsx`:

```typescript
'use client';

import { motion, Variants } from 'framer-motion';
import type { HeroSection } from '@/lib/data/types';

interface HolaMundoProps {
  data: HeroSection;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const letterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    rotateX: -30,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

export default function HolaMundo({ data }: HolaMundoProps): JSX.Element {
  const words = data.greeting.split(' ');

  return (
    <div className="relative text-center px-6 select-none">

      {/* Halos de fondo */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none">
        <div className="absolute inset-0 rounded-full bg-indigo-600/10 blur-3xl animate-pulse-slow" />
        <div className="absolute inset-16 rounded-full bg-violet-600/10 blur-2xl animate-float" />
      </div>

      {/* Línea decorativa superior */}
      <motion.div
        className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.8 }}
      />

      {/* Título animado — letra por letra */}
      <div className="overflow-hidden">
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block mr-[0.25em] last:mr-0">
            <motion.span
              className="inline-flex"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {word.split('').map((letter, letterIndex) => (
                <motion.span
                  key={letterIndex}
                  variants={letterVariants}
                  className="inline-block text-7xl md:text-[9rem] lg:text-[11rem] font-bold leading-none tracking-tight"
                  style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #818cf8 60%, #6366f1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.span>
          </span>
        ))}
      </div>

      {/* Subtítulo */}
      <motion.p
        custom={0.9}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 text-sm md:text-base tracking-[0.3em] uppercase font-mono text-indigo-400"
      >
        {data.subtitle}
      </motion.p>

      {/* Descripción */}
      <motion.p
        custom={1.1}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="mt-4 max-w-sm md:max-w-md mx-auto text-slate-400 text-sm md:text-base leading-relaxed"
      >
        {data.description}
      </motion.p>

      {/* Separador */}
      <motion.div
        className="mx-auto my-8 h-px w-16 bg-gradient-to-r from-transparent via-slate-600 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      />

      {/* Badge de estado */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.5, type: 'spring', stiffness: 300 }}
        className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-indigo-500/20 bg-indigo-950/50 backdrop-blur-sm"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
        </span>
        <span className="text-xs font-mono text-slate-300 tracking-wider">
          {data.badge}
        </span>
      </motion.div>

      {/* Grid decorativo de fondo */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
```

---

### 3.6 Página Home — Server Component

Actualizar `app/page.tsx`:

```typescript
import type { Metadata } from 'next';
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

export default function HomePage(): JSX.Element {
  return (
    <PageWrapper>
      <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#020617]">
        <HolaMundo data={homeData.hero} />
      </main>
    </PageWrapper>
  );
}
```

---

### 3.7 Verificación Visual

```bash
npm run dev
# Abrir http://localhost:3000
```

**Checklist visual:**

- [ ] Fondo oscuro (`#020617`) aplicado a toda la pantalla
- [ ] "Hola Mundo" perfectamente centrado horizontal y vertical
- [ ] Letras aparecen una a una con efecto suave de abajo hacia arriba
- [ ] Gradiente blanco → índigo visible en el texto
- [ ] Halos/glows de fondo animados
- [ ] Grid decorativo sutil de fondo
- [ ] Subtítulo aparece con retraso después del título
- [ ] Badge verde pulsante aparece al final de la secuencia
- [ ] Responsive en móvil y escritorio

---

### ✅ Criterios de Aceptación — Fase 3

- [ ] Home renderiza correctamente en `localhost:3000`
- [ ] Datos provienen del archivo JSON (no hardcodeados)
- [ ] Todos los componentes están tipados sin uso de `any`
- [ ] Props validadas entre `page.tsx` → `HolaMundo.tsx`
- [ ] Animaciones funcionan sin errores en consola
- [ ] Responsive: móvil, tablet y escritorio
- [ ] `npm run type-check` retorna **0 errores**
- [ ] Commit: `feat: home page with elegant TypeScript-powered animation`

---

## FASE 4 — CI/CD GitHub + Vercel

> **Duración estimada:** 1–2 horas  
> **Objetivo:** Configurar el pipeline de integración y despliegue continuo para que cada `push` a `main` genere un deploy automático en Vercel con validaciones previas.

### 4.1 Configurar Vercel

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión
2. Clic en **"Add New Project"**
3. Seleccionar **"Import Git Repository"**
4. Conectar la cuenta GitHub si no está conectada
5. Seleccionar el repositorio `mi-proyecto-fullstack`
6. Vercel detecta Next.js automáticamente — no cambiar configuración
7. En **"Environment Variables"** agregar:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0` |
| `NODE_ENV` | `production` |

8. Clic en **"Deploy"**
9. Esperar el primer deploy (2–3 minutos)
10. Copiar la URL de producción generada

---

### 4.2 Crear el Archivo `vercel.json`

En la raíz del proyecto crear `vercel.json`:

```json
{
  "buildCommand": "npm run validate && next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["gru1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ]
}
```

> **`gru1`** = Región de São Paulo, Brasil — la más cercana a Colombia en la red de Vercel.

---

### 4.3 Crear el Archivo `.env.example`

```bash
# ── Aplicación ─────────────────────────────────────────────
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Entorno ────────────────────────────────────────────────
# Vercel inyecta NODE_ENV automáticamente en cada deploy
# NODE_ENV=development | production | preview
```

Crear `.env.local` (no se sube a GitHub):

```bash
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Verificar que `.gitignore` incluye:

```
.env.local
.env*.local
```

---

### 4.4 Configurar GitHub Actions

Crear `.github/workflows/ci.yml`:

```yaml
name: CI — Validate TypeScript & Lint

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main

jobs:
  validate:
    name: Type Check + Lint + Build
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: 📥 Checkout del código
        uses: actions/checkout@v4

      - name: ⚙️ Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 📦 Instalar dependencias
        run: npm ci

      - name: 🔷 Verificar TypeScript
        run: npm run type-check

      - name: 🔍 Verificar ESLint
        run: npm run lint

      - name: 🏗️ Verificar Build
        run: npm run build

      - name: ✅ Validación completada
        run: echo "Todos los checks pasaron correctamente"
```

---

### 4.5 Configurar Ramas de Trabajo

```bash
# Crear rama develop
git checkout -b develop
git push -u origin develop

# En Vercel Dashboard → Settings → Git:
# Production Branch: main
# Preview Branches: develop, feature/*
```

**Flujo de trabajo establecido:**

```
feature/nombre  ──► Pull Request a develop
                         │
                         ▼
                    GitHub Actions CI
                    (type-check + lint + build)
                         │
                    ✅ Si pasa
                         │
                         ▼
                    Preview URL en Vercel
                    (deploy automático)
                         │
                    Merge a main
                         │
                         ▼
                    Deploy a Producción ✅
```

---

### 4.6 Verificar el Pipeline Completo

```bash
# Hacer un cambio menor para probar el pipeline
git add .
git commit -m "ci: add GitHub Actions workflow and Vercel config"
git push origin main
```

**Verificar:**
- [ ] GitHub Actions ejecuta el workflow en la pestaña **Actions**
- [ ] Vercel genera un nuevo deploy automáticamente
- [ ] La URL de producción muestra el Home correctamente
- [ ] Los logs de Vercel muestran `npm run validate` exitoso

---

### ✅ Criterios de Aceptación — Fase 4

- [ ] Proyecto conectado y desplegado en Vercel
- [ ] URL de producción pública funcionando
- [ ] GitHub Actions ejecuta `type-check + lint + build` en cada push
- [ ] Pull Requests generan Preview URLs automáticas
- [ ] `vercel.json` con región `gru1` configurada
- [ ] Variables de entorno configuradas en Vercel Dashboard
- [ ] Rama `develop` creada y conectada a Vercel como preview
- [ ] Commit: `ci: GitHub Actions + Vercel production pipeline ready`

---

## FASE 5 — Validación Final y Cierre

> **Duración estimada:** 1 hora  
> **Objetivo:** Verificar la integridad completa del sistema, documentar el estado del proyecto y dejar la base lista para el roadmap de expansión.

### 5.1 Auditoría de TypeScript

```bash
# Verificación completa sin errores
npm run type-check

# Resultado esperado:
# > tsc --noEmit
# (sin output = 0 errores ✅)
```

**Checklist de tipado:**

- [ ] Sin uso de `any` en toda la base de código
- [ ] Todos los props de componentes tipados con interfaces
- [ ] Funciones con tipos de retorno explícitos
- [ ] Archivos JSON mapeados a interfaces TypeScript
- [ ] Genéricos usados correctamente en `reader.ts`
- [ ] Tipos discriminados en `DataReadResult<T>`

---

### 5.2 Auditoría de la Capa de Datos

```bash
# Probar el endpoint de datos en producción
curl https://TU-URL.vercel.app/api/data

# Resultado esperado: JSON válido con estructura tipada
```

**Verificar:**

- [ ] `GET /api/data` retorna `200` con datos del home
- [ ] Datos en la respuesta coinciden exactamente con `home.json`
- [ ] Esquema Zod valida correctamente el JSON
- [ ] Error handling funciona (probar con JSON corrupto temporalmente)

---

### 5.3 Auditoría Visual y de Performance

Abrir la URL de producción en:

- [ ] Chrome — escritorio
- [ ] Safari — escritorio  
- [ ] Chrome — móvil (devtools)
- [ ] Firefox — escritorio

**Verificar en cada navegador:**

- [ ] "Hola Mundo" perfectamente centrado
- [ ] Animaciones fluidas (sin jank)
- [ ] Sin errores en consola del navegador
- [ ] Sin warnings de React
- [ ] Gradiente del texto visible
- [ ] Badge pulsante funcionando
- [ ] Fuentes cargando correctamente

**Métricas de Vercel Analytics (si está habilitado):**

| Métrica | Objetivo |
|---------|----------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |

---

### 5.4 Auditoría del Pipeline CI/CD

**Crear un Pull Request de prueba:**

```bash
git checkout -b test/pipeline-validation
echo "# Test" >> TEST.md
git add .
git commit -m "test: pipeline validation PR"
git push origin test/pipeline-validation
```

- [ ] GitHub Actions ejecuta correctamente
- [ ] Preview URL generada en el PR
- [ ] El Home en la Preview URL funciona igual que en producción
- [ ] Hacer merge y verificar deploy a producción
- [ ] Eliminar la rama de test

---

### 5.5 Documentación Final del Proyecto

Actualizar `README.md` en el repositorio:

```markdown
# Mi App Fullstack TypeScript

Sistema fullstack con Next.js 14, TypeScript estricto, capa de datos JSON y despliegue automatizado en Vercel.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript 5 (strict mode)
- **UI:** React 18 + Tailwind CSS + Framer Motion
- **Datos:** JSON files (data/)
- **Deploy:** Vercel (región GRU — São Paulo)
- **CI:** GitHub Actions

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run type-check` | Verificar tipos TypeScript |
| `npm run lint` | Verificar ESLint |
| `npm run validate` | type-check + lint |

## Estructura

- `app/` — Páginas y API Routes (Next.js App Router)
- `components/` — Componentes React tipados
- `data/` — Archivos JSON (capa de datos)
- `lib/` — Utilidades y tipos TypeScript
- `types/` — Tipos globales

## URLs

- **Producción:** https://TU-URL.vercel.app
- **API Datos:** https://TU-URL.vercel.app/api/data
```

---

### 5.6 Resumen del Estado Final del Sistema

```
✅ SISTEMA VALIDADO Y EN PRODUCCIÓN

┌──────────────────────────────────────────────────────────┐
│                   STACK VERIFICADO                        │
├──────────────────┬───────────────────────────────────────┤
│ TypeScript       │ strict mode · 0 errores               │
│ Next.js          │ App Router · Server + Client          │
│ Tailwind CSS     │ Configurado en TypeScript             │
│ Framer Motion    │ Animaciones tipadas funcionando       │
│ Capa JSON        │ Tipos + Zod validation activos        │
│ GitHub Actions   │ type-check + lint + build en CI       │
│ Vercel           │ Deploy automático desde main          │
│ Preview URLs     │ Por cada Pull Request                 │
│ Región           │ GRU (São Paulo) — baja latencia CO    │
└──────────────────┴───────────────────────────────────────┘
```

---

### ✅ Criterios de Aceptación — Fase 5 (Cierre)

- [ ] `npm run type-check` → **0 errores**
- [ ] `npm run lint` → **0 warnings**
- [ ] `npm run build` → **Build exitoso**
- [ ] URL producción accesible y Home funcionando
- [ ] `GET /api/data` retorna datos JSON correctos
- [ ] GitHub Actions verde en todos los checks
- [ ] README.md actualizado con URLs y documentación
- [ ] Sin `console.log` ni código de debug en producción

---

## Resumen General de Fases

| Fase | Entregable Principal | Tiempo | Commit de Cierre |
|------|----------------------|--------|------------------|
| **Fase 1** | Proyecto TypeScript inicializado y en GitHub | 2–3h | `feat: initial project setup` |
| **Fase 2** | Capa de datos JSON con tipos y validación Zod | 2–3h | `feat: JSON data layer with Zod` |
| **Fase 3** | Home "Hola Mundo" con efecto visual elegante | 3–4h | `feat: home page with animation` |
| **Fase 4** | CI/CD GitHub Actions + Vercel producción | 1–2h | `ci: GitHub Actions + Vercel pipeline` |
| **Fase 5** | Validación completa y documentación | 1h | `docs: final validation and README` |
| **TOTAL** | **Sistema en producción** | **9–13h** | — |

---

> **Principio rector de la implementación:**  
> Cada fase debe dejar el sistema en un estado funcional y demostrable antes de avanzar a la siguiente. No existe "código en progreso" — solo versiones que funcionan y versiones que aún no existen.
