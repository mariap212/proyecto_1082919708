'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPatch, formatDate } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Role } from '@/lib/types';

interface UserBrief {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
}

const ROLE_BADGE: Record<Role, string> = {
  admin: 'bg-amber-500/15 text-amber-300',
  vendedor: 'bg-sky-500/15 text-sky-300',
  bodeguero: 'bg-emerald-500/15 text-emerald-300',
  conductor: 'bg-violet-500/15 text-violet-300',
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserBrief[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<UserBrief | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    apiGet<UserBrief[]>('/api/users').then(setUsers).catch(() => undefined);
  }, [refresh]);

  return (
    <>
      <PageHeader
        title="Usuarios"
        subtitle="RN-08: solo administrador gestiona usuarios"
        actions={<button onClick={() => setCreating(true)} className="btn-primary">+ Nuevo usuario</button>}
      />

      <div className="rounded-xl border border-white/5 bg-slate-950/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-center">Rol</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-left">Creado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-slate-200">{u.name}</td>
                <td className="px-4 py-3 text-slate-400">{u.email}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${ROLE_BADGE[u.role]}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${u.is_active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700/40 text-slate-400'}`}>
                    {u.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(u)} className="text-amber-300 text-xs hover:underline">Editar</button>
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Sin usuarios</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {creating && <NewUserModal onClose={() => setCreating(false)} onSaved={() => { setCreating(false); setRefresh((r) => r + 1); }} />}
      {editing && <EditUserModal user={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setRefresh((r) => r + 1); }} />}

      <style>{`
        .input { width:100%; padding:.5rem .75rem; border-radius:.5rem; background:rgba(2,6,23,.6); color:#e2e8f0; border:1px solid rgba(255,255,255,.08); font-size:.875rem; outline:none; }
        .input:focus { border-color:rgba(245,158,11,.5); }
        .btn-primary { padding:.6rem 1rem; border-radius:.5rem; background:linear-gradient(to right,#f59e0b,#d97706); color:#fff; font-weight:600; font-size:.875rem; }
        .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
        .btn-secondary { padding:.6rem 1rem; border-radius:.5rem; background:rgba(255,255,255,.06); color:#cbd5e1; font-weight:500; font-size:.875rem; }
      `}</style>
    </>
  );
}

function NewUserModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('vendedor');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await apiPost('/api/users', { name, email, role, password });
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Nuevo usuario" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Nombre completo" required value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="admin">Admin</option>
          <option value="vendedor">Vendedor</option>
          <option value="bodeguero">Bodeguero</option>
          <option value="conductor">Conductor</option>
        </select>
        <input className="input" type="password" placeholder="Contraseña inicial" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="text-rose-400 text-sm">{err}</p>}
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button disabled={busy} className="btn-primary">{busy ? 'Creando…' : 'Crear'}</button>
        </div>
      </form>
    </Modal>
  );
}

function EditUserModal({ user, onClose, onSaved }: { user: UserBrief; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<Role>(user.role);
  const [active, setActive] = useState(user.is_active);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const patch: Record<string, unknown> = { name, role, is_active: active };
      if (password) patch.password = password;
      await apiPatch(`/api/users/${user.id}`, patch);
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={`Editar ${user.email}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="admin">Admin</option>
          <option value="vendedor">Vendedor</option>
          <option value="bodeguero">Bodeguero</option>
          <option value="conductor">Conductor</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Activo
        </label>
        <input className="input" type="password" placeholder="Nueva contraseña (vacío = mantener)" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="text-rose-400 text-sm">{err}</p>}
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button disabled={busy} className="btn-primary">{busy ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
