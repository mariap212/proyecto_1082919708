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