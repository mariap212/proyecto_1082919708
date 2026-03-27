# Plan de Infraestructura — Fullstack TypeScript con GitHub + Vercel

> **Arquitecto:** Plan generado para stack TypeScript fullstack  
> **Versión:** 1.0.0  
> **Fecha:** Marzo 2026

---

## Índice

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura del Repositorio](#3-estructura-del-repositorio)
4. [Capa de Datos — JSON como Base de Datos](#4-capa-de-datos--json-como-base-de-datos)
5. [Arquitectura de la Aplicación](#5-arquitectura-de-la-aplicación)
6. [Configuración del Proyecto](#6-configuración-del-proyecto)
7. [Implementación del Home — Hola Mundo](#7-implementación-del-home--hola-mundo)
8. [Pipeline CI/CD — GitHub + Vercel](#8-pipeline-cicd--github--vercel)
9. [Variables de Entorno](#9-variables-de-entorno)
10. [Checklist de Validación](#10-checklist-de-validación)
11. [Roadmap de Expansión](#11-roadmap-de-expansión)

---

## 1. Visión General

Este plan define la infraestructura completa para una aplicación fullstack basada en **TypeScript**, desplegada automáticamente en **Vercel** desde un repositorio **GitHub**, utilizando una capa de persistencia basada en **archivos JSON** en lugar de una base de datos convencional.

### Objetivos del MVP

- ✅ Proyecto TypeScript funcional en frontend y backend
- ✅ Despliegue automatizado vía GitHub → Vercel
- ✅ Sistema de datos basado en archivos `.json` (capa `data/`)
- ✅ Home con mensaje "Hola Mundo" centrado con efecto visual elegante
- ✅ Validación completa del sistema de tipos TypeScript en toda la cadena

### Diagrama de Flujo General

```
Desarrollador
     │
     ▼
 Git Push ──► GitHub Repository
                    │
                    ▼ (Webhook automático)
              Vercel Build Pipeline
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
    Next.js Frontend    API Routes (Backend)
    (React + TS)        (TypeScript)
                             │
                             ▼
                      /data/*.json
                    (Capa de datos)
```

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión | Justificación |
|------|-----------|---------|---------------|
| **Framework** | Next.js | 14+ (App Router) | SSR, API Routes y despliegue nativo en Vercel |
| **Lenguaje** | TypeScript | 5.x | Tipado estático en toda la aplicación |
| **UI** | React | 18+ | Componentes con soporte completo de TypeScript |
| **Estilos** | Tailwind CSS | 3.x | Utilidades CSS con configuración en TS |
| **Animaciones** | Framer Motion | 11.x | Efectos elegantes tipados |
| **Linting** | ESLint + Prettier | Latest | Calidad de código uniforme |
| **Build** | Turbopack (via Next.js) | Incluido | Compilación ultrarrápida |
| **Deploy** | Vercel | — | Integración nativa con Next.js |
| **Control de versiones** | GitHub | — | Repositorio fuente de verdad |

---

## 3. Estructura del Repositorio

```
mi-proyecto/
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions — linting y type-check
│
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Layout raíz con metadata
│   ├── page.tsx                    # Home — Hola Mundo
│   ├── globals.css                 # Estilos globales + variables CSS
│   └── api/
│       └── data/
│           └── route.ts            # API Route para leer archivos JSON
│
├── components/
│   ├── ui/
│   │   └── HolaMundo.tsx           # Componente principal del Home
│   └── layout/
│       └── PageWrapper.tsx         # Wrapper con animaciones de entrada
│
├── data/                           # 📁 CAPA DE DATOS (JSON como DB)
│   ├── config.json                 # Configuración general de la app
│   ├── pages/
│   │   └── home.json               # Contenido de la página Home
│   └── README.md                   # Documentación del esquema de datos
│
├── lib/
│   ├── data/
│   │   ├── reader.ts               # Utilidad para leer archivos JSON
│   │   └── types.ts                # Tipos TypeScript del esquema de datos
│   └── utils/
│       └── cn.ts                   # Utility de clases CSS
│
├── types/
│   └── index.ts                    # Tipos globales de la aplicación
│
├── public/
│   └── fonts/                      # Fuentes locales si se requieren
│
├── .env.local                      # Variables de entorno locales (no en git)
├── .env.example                    # Plantilla de variables de entorno
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── next.config.ts                  # Configuración Next.js en TypeScript
├── tailwind.config.ts              # Configuración Tailwind en TypeScript
├── tsconfig.json                   # Configuración TypeScript estricta
├── package.json
└── vercel.json                     # Configuración de despliegue Vercel
```

---

## 4. Capa de Datos — JSON como Base de Datos

### Filosofía

La carpeta `data/` actúa como una base de datos de solo lectura en producción (los archivos `.json` están en el repositorio). Para operaciones de escritura en entornos dinámicos, las API Routes de Next.js manipulan los archivos en tiempo de ejecución en entornos que lo permitan (desarrollo local).

> **Nota importante:** Vercel es un entorno serverless. Los archivos dentro del bundle del proyecto son de **solo lectura** en producción. Para escritura persistente en producción, se recomienda en fases futuras usar Vercel KV, PlanetScale o similares. Para el MVP, la capa JSON es perfecta para datos estáticos.

### Estructura de Archivos JSON

**`data/config.json`**
```json
{
  "app": {
    "name": "Mi App TypeScript",
    "version": "1.0.0",
    "language": "es"
  },
  "theme": {
    "primaryColor": "#0f172a",
    "accentColor": "#6366f1"
  }
}
```

**`data/pages/home.json`**
```json
{
  "hero": {
    "greeting": "Hola Mundo",
    "subtitle": "TypeScript · Next.js · Vercel",
    "description": "Sistema fullstack funcionando correctamente."
  },
  "meta": {
    "title": "Home | Mi App",
    "description": "Página principal del sistema"
  }
}
```

### Utilidad de Lectura — `lib/data/reader.ts`

```typescript
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export function readJsonFile<T>(filePath: string): T {
  const fullPath = path.join(DATA_DIR, filePath);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(fileContents) as T;
}

export function readJsonFileSafe<T>(filePath: string): T | null {
  try {
    return readJsonFile<T>(filePath);
  } catch {
    return null;
  }
}
```

### Tipos TypeScript — `lib/data/types.ts`

```typescript
export interface AppConfig {
  app: {
    name: string;
    version: string;
    language: string;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
  };
}

export interface HomePageData {
  hero: {
    greeting: string;
    subtitle: string;
    description: string;
  };
  meta: {
    title: string;
    description: string;
  };
}
```

---

## 5. Arquitectura de la Aplicación

### Flujo de Datos en el Home

```
page.tsx (Server Component)
    │
    ├── readJsonFile<HomePageData>('pages/home.json')
    │       └── Retorna datos tipados
    │
    └── <HolaMundo data={homeData} />  (Client Component)
            └── Framer Motion animation
                └── Render elegante en pantalla
```

### Separación de Responsabilidades

| Capa | Archivo | Responsabilidad |
|------|---------|----------------|
| **Página (Server)** | `app/page.tsx` | Lee datos JSON, pasa props tipados |
| **Componente (Client)** | `components/ui/HolaMundo.tsx` | Renderiza con animaciones |
| **API Route** | `app/api/data/route.ts` | Expone datos JSON vía HTTP |
| **Utilidad** | `lib/data/reader.ts` | Abstracción de lectura de archivos |
| **Tipos** | `lib/data/types.ts` | Contratos TypeScript de los datos |

---

## 6. Configuración del Proyecto

### `tsconfig.json` — Configuración Estricta

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

### `next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false, // ❗ TypeScript estricto en build
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
```

### `package.json` — Scripts Clave

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

### `vercel.json`

```json
{
  "buildCommand": "npm run validate && next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["gru1"]
}
```

> `gru1` = São Paulo, la región de Vercel más cercana a Colombia.

---

## 7. Implementación del Home — Hola Mundo

### `app/page.tsx` — Server Component

```typescript
import { readJsonFile } from '@/lib/data/reader';
import { HomePageData } from '@/lib/data/types';
import HolaMundo from '@/components/ui/HolaMundo';
import type { Metadata } from 'next';

const homeData = readJsonFile<HomePageData>('pages/home.json');

export const metadata: Metadata = {
  title: homeData.meta.title,
  description: homeData.meta.description,
};

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <HolaMundo data={homeData.hero} />
    </main>
  );
}
```

### `components/ui/HolaMundo.tsx` — Client Component con Efecto Elegante

```typescript
'use client';

import { motion } from 'framer-motion';

interface HeroData {
  greeting: string;
  subtitle: string;
  description: string;
}

interface HolaMundoProps {
  data: HeroData;
}

const letterVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function HolaMundo({ data }: HolaMundoProps) {
  const letters = data.greeting.split('');

  return (
    <div className="text-center px-4">
      {/* Glow de fondo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Letras animadas */}
      <motion.h1
        className="text-7xl md:text-9xl font-bold tracking-tight"
        initial="hidden"
        animate="visible"
        aria-label={data.greeting}
      >
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={letterVariants}
            className="inline-block bg-gradient-to-b from-white to-indigo-300 bg-clip-text text-transparent"
            style={{ display: letter === ' ' ? 'inline' : 'inline-block' }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        ))}
      </motion.h1>

      {/* Subtítulo */}
      <motion.p
        className="mt-6 text-indigo-400 text-lg tracking-widest uppercase font-mono"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {data.subtitle}
      </motion.p>

      {/* Descripción */}
      <motion.p
        className="mt-4 text-slate-400 text-base max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
      >
        {data.description}
      </motion.p>

      {/* Indicador de TypeScript OK */}
      <motion.div
        className="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.5, type: 'spring' }}
      >
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm text-slate-300 font-mono">TypeScript · OK</span>
      </motion.div>
    </div>
  );
}
```

### Efecto Visual — Descripción

| Elemento | Efecto | Tecnología |
|----------|--------|-----------|
| Letras del título | Aparecen una a una desde abajo con easing suave | Framer Motion `stagger` |
| Texto del título | Gradiente blanco → índigo | Tailwind `bg-clip-text` |
| Fondo | Halo/glow suave índigo | Tailwind `blur-3xl` + opacidad |
| Subtítulo | Fade-in con slide up | Framer Motion |
| Badge "TypeScript OK" | Scale spring + pulso verde | Framer Motion + CSS `animate-pulse` |

---

## 8. Pipeline CI/CD — GitHub + Vercel

### Configuración GitHub → Vercel

1. Crear repositorio en GitHub (público o privado)
2. Ir a [vercel.com](https://vercel.com) → **New Project**
3. Importar el repositorio de GitHub
4. Vercel detecta Next.js automáticamente
5. Configurar variables de entorno en el dashboard de Vercel
6. ✅ Cada `git push` a `main` dispara un deploy automático
7. ✅ Cada Pull Request genera un **Preview URL** único

### `.github/workflows/ci.yml` — GitHub Actions

```yaml
name: CI — Type Check & Lint

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    name: TypeScript & ESLint
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Build check
        run: npm run build
```

### Flujo de Ramas

```
feature/xxx  ──► Pull Request ──► Preview URL (Vercel)
                      │
                      ▼ (merge aprobado)
                   develop  ──► Staging URL
                      │
                      ▼ (release)
                    main  ──► Producción (dominio principal)
```

---

## 9. Variables de Entorno

### `.env.example`

```bash
# Entorno de la aplicación
NODE_ENV=development

# URL base de la aplicación (Vercel la inyecta automáticamente)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Versión de la aplicación
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Variables automáticas de Vercel

Vercel inyecta estas variables automáticamente en cada deploy sin configuración adicional:

| Variable | Descripción |
|----------|------------|
| `VERCEL_URL` | URL del deploy actual |
| `VERCEL_ENV` | `production`, `preview` o `development` |
| `VERCEL_GIT_COMMIT_SHA` | Hash del commit desplegado |
| `VERCEL_GIT_COMMIT_MESSAGE` | Mensaje del commit |

---

## 10. Checklist de Validación

### Configuración Inicial

- [ ] Repositorio creado en GitHub con `README.md`
- [ ] Proyecto inicializado: `npx create-next-app@latest --typescript`
- [ ] Tailwind CSS configurado con archivo `.ts`
- [ ] Framer Motion instalado: `npm install framer-motion`
- [ ] `tsconfig.json` con modo `strict: true`
- [ ] Carpeta `data/` creada con archivos JSON base
- [ ] Utilidad `lib/data/reader.ts` implementada
- [ ] Tipos `lib/data/types.ts` definidos

### Componentes

- [ ] `app/layout.tsx` con metadata base
- [ ] `app/page.tsx` leyendo datos del JSON correctamente
- [ ] `components/ui/HolaMundo.tsx` con animaciones funcionando
- [ ] Props tipados correctamente entre todos los componentes
- [ ] Sin errores de TypeScript (`npm run type-check` limpio)

### Integración GitHub + Vercel

- [ ] Proyecto conectado en Vercel desde GitHub
- [ ] Deploy automático funcionando en `push` a `main`
- [ ] Preview URL generada en Pull Requests
- [ ] Variables de entorno configuradas en Vercel Dashboard
- [ ] GitHub Actions ejecutándose correctamente

### Validación Visual

- [ ] "Hola Mundo" centrado horizontal y verticalmente
- [ ] Efecto de letras animadas funcionando
- [ ] Gradiente visible en el texto
- [ ] Badge "TypeScript · OK" visible
- [ ] Responsive en móvil y escritorio

### TypeScript — Validaciones Clave

- [ ] `strict: true` sin errores en toda la app
- [ ] `noImplicitReturns: true` respetado
- [ ] `noUnusedLocals: true` sin warnings
- [ ] Tipos de datos JSON correctamente mapeados
- [ ] Sin uso de `any` en toda la base de código

---

## 11. Roadmap de Expansión

Una vez validado el MVP, la arquitectura permite escalar naturalmente:

### Fase 2 — Sistema de Contenido

- Múltiples páginas leyendo desde `data/pages/*.json`
- Sistema de navegación dinámico desde `data/navigation.json`
- API Routes para exponer los datos JSON vía REST

### Fase 3 — CMS Básico

- Interfaz de administración para editar los archivos JSON
- Validación de esquemas JSON con `zod`
- Historial de cambios via Git commits automáticos

### Fase 4 — Persistencia Escalable

- Migración gradual de `data/*.json` a Vercel KV (Redis)
- Mantener JSON como fallback y seed data
- Caché en el edge con `unstable_cache` de Next.js

### Fase 5 — Observabilidad

- Vercel Analytics integrado
- Error tracking con Sentry (SDK TypeScript)
- Logs estructurados en Vercel Dashboard

---

## Comandos de Inicio Rápido

```bash
# 1. Crear el proyecto
npx create-next-app@latest mi-proyecto \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

# 2. Entrar al proyecto
cd mi-proyecto

# 3. Instalar dependencias adicionales
npm install framer-motion

# 4. Crear estructura de datos
mkdir -p data/pages
echo '{"app":{"name":"Mi App","version":"1.0.0"}}' > data/config.json

# 5. Validar TypeScript
npm run type-check

# 6. Correr en desarrollo
npm run dev

# 7. Push inicial a GitHub
git add .
git commit -m "feat: initial project setup with TypeScript + JSON data layer"
git push origin main
```

---

> **Plan elaborado bajo principios de:** TypeScript-first, Zero Database Overhead, CI/CD automatizado, y despliegue edge-optimizado en Vercel.  
> Cada decisión técnica prioriza la **seguridad de tipos** en toda la cadena: desde los archivos JSON hasta los props de los componentes React.