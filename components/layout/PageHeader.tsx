import { Eyebrow } from '@/components/ui/primitives';

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-10 animate-rise">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="space-y-3 max-w-3xl">
          {eyebrow && (
            <div className="flex items-center gap-3">
              <span className="block w-6 h-px bg-amber-400/70" aria-hidden />
              <Eyebrow>{eyebrow}</Eyebrow>
            </div>
          )}
          <h1 className="heading-serif text-4xl md:text-5xl text-slate-50 text-balance leading-[1.05]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm md:text-[0.95rem] text-slate-400 leading-relaxed max-w-2xl text-pretty">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex gap-2 items-center shrink-0">{actions}</div>}
      </div>
      <div className="mt-8 h-px bg-gradient-to-r from-amber-400/20 via-white/[0.06] to-transparent" />
    </header>
  );
}
