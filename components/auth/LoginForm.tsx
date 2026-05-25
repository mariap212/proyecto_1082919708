'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
        setError(data.error || 'Credenciales inválidas');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('No se pudo conectar al servidor');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="eyebrow block mb-2">Correo electrónico</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@ovogest.local"
          className="input mono"
          autoComplete="email"
          autoFocus
        />
      </label>

      <label className="block">
        <span className="eyebrow block mb-2">Contraseña</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input"
          autoComplete="current-password"
        />
      </label>

      {error && (
        <div className="panel-tight !p-3 border-rose-500/30">
          <p className="text-xs text-rose-300">✗ {error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full justify-center mt-2"
      >
        {loading ? 'Ingresando…' : 'Ingresar al sistema →'}
      </button>
    </form>
  );
}
