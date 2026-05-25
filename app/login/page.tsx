import type { Metadata } from 'next';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Acceso',
  description: 'OvoGest · Sistema de distribución mayorista',
};

export default async function LoginPage() {
  const session = await getAuthSession();
  if (session) redirect('/dashboard');

  return (
    <div className="min-h-screen flex">
      {/* Left — Editorial brand pane */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden border-r border-white/[0.05] bg-gradient-to-br from-slate-950 via-[#0a1322] to-slate-950">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 30% 20%, rgba(245,158,11,0.16), transparent 35%), radial-gradient(circle at 70% 80%, rgba(56,189,248,0.08), transparent 30%)',
          }}
        />

        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(245,158,11,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-md bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 grid place-items-center text-amber-950 font-serif italic text-xl">
                o
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-300 animate-pulse-dot" />
              </div>
              <div className="heading-serif text-xl text-white">OvoGest</div>
            </div>
            <div className="eyebrow mt-4">Sistema de distribución mayorista</div>
          </div>

          <div className="max-w-md">
            <div className="eyebrow mb-4">Edición · Producción</div>
            <p className="heading-serif text-4xl xl:text-5xl text-slate-50 leading-[1.05] text-balance">
              Una <span className="text-amber-200/90 italic">operación clara</span> es una operación rentable.
            </p>
            <p className="mt-6 text-sm text-slate-400 leading-relaxed max-w-sm">
              Inventario en tiempo real, pedidos con flujo guiado, entregas con seguimiento de
              estado y facturación consecutiva — todo en un solo lugar.
            </p>
          </div>

          <div className="flex items-center justify-between text-[0.65rem] text-slate-600">
            <div className="flex items-center gap-3">
              <span className="mono">v1.0</span>
              <span className="w-1 h-1 rounded-full bg-amber-400/60" />
              <span>Construido en Next.js</span>
            </div>
            <div className="mono">{new Date().getFullYear()}</div>
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(circle at 80% 20%, rgba(245,158,11,0.04), transparent 30%)',
          }}
        />
        <div className="relative w-full max-w-sm animate-rise">
          <div className="mb-10">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 grid place-items-center text-amber-950 font-serif italic">o</div>
              <span className="heading-serif text-lg text-white">OvoGest</span>
            </div>
            <span className="eyebrow">Acceso al sistema</span>
            <h1 className="heading-serif text-4xl text-slate-50 mt-3 leading-tight">
              Iniciar sesión
            </h1>
            <p className="text-sm text-slate-400 mt-3">
              Ingresa con tu correo corporativo y contraseña.
            </p>
          </div>

          <LoginForm />

          <div className="mt-8 pt-6 border-t border-white/[0.05]">
            <details className="text-xs text-slate-500 group">
              <summary className="cursor-pointer hover:text-slate-300 transition-colors select-none">
                Credenciales de demostración
              </summary>
              <div className="mt-3 space-y-1.5 mono text-[0.7rem] text-slate-500">
                <div>admin@ovogest.local · password123</div>
                <div>vendedor@ovogest.local · password123</div>
                <div>bodeguero@ovogest.local · password123</div>
                <div>conductor@ovogest.local · password123</div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
