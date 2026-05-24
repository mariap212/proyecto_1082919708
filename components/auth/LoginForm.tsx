'use client';

import React, { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Error de autenticación');
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.user?.must_change_password) {
        router.push('/change-password');
      } else {
        router.push('/dashboard');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as any },
    },
  } as any;

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  } as any;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md"
    >
      {/* Card principal con vidrio */}
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Gradiente de fondo sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent pointer-events-none" />

        <div className="relative z-10 p-10">
          {/* Logo animado */}
          <motion.div
            custom={0}
            variants={itemVariants}
            className="flex justify-center mb-8"
          >
            <motion.div
              whileHover={{ rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 52 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="8" y="10" width="36" height="28" rx="2" fill="none" stroke="#FFF" strokeWidth="2" />
                <line x1="14" y1="10" x2="14" y2="38" stroke="#FFF" strokeWidth="1.5" />
                <line x1="20" y1="10" x2="20" y2="38" stroke="#FFF" strokeWidth="1.5" />
                <line x1="26" y1="10" x2="26" y2="38" stroke="#FFF" strokeWidth="1.5" />
                <line x1="32" y1="10" x2="32" y2="38" stroke="#FFF" strokeWidth="1.5" />
                <line x1="38" y1="10" x2="38" y2="38" stroke="#FFF" strokeWidth="1.5" />
                <circle cx="17" cy="16" r="2" fill="#FFF" />
                <circle cx="23" cy="16" r="2" fill="#FFF" />
                <circle cx="29" cy="16" r="2" fill="#FFF" />
                <circle cx="35" cy="16" r="2" fill="#FFF" />
                <circle cx="17" cy="24" r="2" fill="#FFF" />
                <circle cx="23" cy="24" r="2" fill="#FFF" />
                <circle cx="29" cy="24" r="2" fill="#FFF" />
                <circle cx="35" cy="24" r="2" fill="#FFF" />
                <circle cx="17" cy="32" r="2" fill="#FFF" />
                <circle cx="23" cy="32" r="2" fill="#FFF" />
                <circle cx="29" cy="32" r="2" fill="#FFF" />
                <circle cx="35" cy="32" r="2" fill="#FFF" />
              </svg>
            </motion.div>
          </motion.div>

          {/* Título y subtítulo */}
          <motion.div custom={1} variants={itemVariants} className="text-center mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent mb-1">
              OvoGest
            </h1>
          </motion.div>
          <motion.p custom={2} variants={itemVariants} className="text-center text-sm text-slate-600 mb-8 tracking-wide">
            Gestión de distribución mayorista
          </motion.p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <motion.div custom={3} variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                Correo Electrónico
              </label>
              <motion.div
                animate={{
                  boxShadow: emailFocused ? '0 0 0 3px rgba(217, 119, 6, 0.1)' : '0 2px 8px rgba(0,0,0, 0.05)',
                }}
              >
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="tu@email.com"
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 transition-colors text-slate-800 placeholder-slate-400"
                  disabled={loading}
                />
              </motion.div>
            </motion.div>

            {/* Contraseña */}
            <motion.div custom={4} variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-3">
                Contraseña
              </label>
              <motion.div
                animate={{
                  boxShadow: passwordFocused ? '0 0 0 3px rgba(217, 119, 6, 0.1)' : '0 2px 8px rgba(0,0,0, 0.05)',
                }}
              >
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 transition-colors text-slate-800 placeholder-slate-400"
                  disabled={loading}
                />
              </motion.div>
            </motion.div>

            {/* Error message animado */}
            <motion.div
              custom={5}
              variants={itemVariants}
              initial={error ? 'visible' : 'hidden'}
              animate={error ? 'visible' : 'hidden'}
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-xl"
                >
                  <p className="text-sm font-medium text-red-700">⚠️ {error}</p>
                </motion.div>
              )}
            </motion.div>

            {/* Botón principal */}
            <motion.div custom={6} variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl transition duration-300 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {loading ? (
                  <motion.span
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="inline-flex items-center gap-2"
                  >
                    ⏳ Ingresando...
                  </motion.span>
                ) : (
                  'Ingresar'
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Separador */}
          <motion.div custom={7} variants={itemVariants} className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            <span className="text-xs text-slate-500">v1.0</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          </motion.div>

          {/* Pie */}
          <motion.p custom={8} variants={itemVariants} className="text-center text-xs text-slate-500">
            Distribuidora Mayorista de Huevos
          </motion.p>
        </div>
      </div>

      {/* Card de credenciales */}
      <motion.div
        custom={9}
        variants={itemVariants}
        className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl backdrop-blur-sm"
      >
        <div className="flex items-start gap-2 mb-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-xs font-bold text-amber-900">Prueba rápida:</p>
            <p className="text-xs text-amber-800 mt-1">
              📧 <code className="bg-white/60 px-2 py-0.5 rounded text-amber-900">admin@ovogest.local</code>
            </p>
            <p className="text-xs text-amber-800">
              🔑 <code className="bg-white/60 px-2 py-0.5 rounded text-amber-900">password123</code>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
