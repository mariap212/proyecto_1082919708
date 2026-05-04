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