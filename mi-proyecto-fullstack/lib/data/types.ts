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