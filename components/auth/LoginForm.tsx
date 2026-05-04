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
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-sm"
    >
      <div className="bg-white rounded-[10px] shadow-md border-t-4 border-t-amber-600 p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <svg
            width="52"
            height="52"
            viewBox="0 0 52 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="8" y="10" width="36" height="28" rx="2" fill="none" stroke="#92400E" strokeWidth="2" />
            <line x1="14" y1="10" x2="14" y2="38" stroke="#92400E" strokeWidth="1.5" />
            <line x1="20" y1="10" x2="20" y2="38" stroke="#92400E" strokeWidth="1.5" />
            <line x1="26" y1="10" x2="26" y2="38" stroke="#92400E" strokeWidth="1.5" />
            <line x1="32" y1="10" x2="32" y2="38" stroke="#92400E" strokeWidth="1.5" />
            <line x1="38" y1="10" x2="38" y2="38" stroke="#92400E" strokeWidth="1.5" />
            <circle cx="17" cy="16" r="2" fill="#92400E" />
            <circle cx="23" cy="16" r="2" fill="#92400E" />
            <circle cx="29" cy="16" r="2" fill="#92400E" />
            <circle cx="35" cy="16" r="2" fill="#92400E" />
            <circle cx="17" cy="24" r="2" fill="#92400E" />
            <circle cx="23" cy="24" r="2" fill="#92400E" />
            <circle cx="29" cy="24" r="2" fill="#92400E" />
            <circle cx="35" cy="24" r="2" fill="#92400E" />
            <circle cx="17" cy="32" r="2" fill="#92400E" />
            <circle cx="23" cy="32" r="2" fill="#92400E" />
            <circle cx="29" cy="32" r="2" fill="#92400E" />
            <circle cx="35" cy="32" r="2" fill="#92400E" />
          </svg>
        </div>

        {/* Título */}
        <h1 className="text-center text-2xl font-bold text-slate-800 mb-2">
          OvoGest
        </h1>
        <p className="text-center text-xs tracking-widest uppercase text-slate-500 mb-8">
          Gestión de distribución mayorista.
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ovogest.local"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition"
              disabled={loading}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition"
              disabled={loading}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-6 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition duration-200"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Pie */}
        <p className="text-center text-xs text-slate-400 mt-6 pt-6 border-t border-slate-200">
          Distribuidora Mayorista de Huevos
        </p>
      </div>

      {/* Credenciales de prueba */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
        <p className="text-xs text-amber-800 mb-2 font-semibold">Credenciales de prueba:</p>
        <p className="text-xs text-amber-700">
          <strong>Email:</strong> admin@ovogest.local
        </p>
        <p className="text-xs text-amber-700">
          <strong>Contraseña:</strong> password123
        </p>
      </div>
    </motion.div>
  );
}
