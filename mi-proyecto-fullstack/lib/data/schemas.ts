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