'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPatch, formatDate } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Panel,
  SkeletonTable,
  StatusDot,
  Button,
  EmptyState,
} from '@/components/ui/primitives';
import { Modal } from '@/components/ui/Modal';
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

const ROLE_COLOR: Record<Role, 'amber' | 'sky' | 'emerald' | 'violet'> = {
  admin: 'amber',
  vendedor: 'sky',
  bodeguero: 'emerald',
  conductor: 'violet',
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserBrief[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<UserBrief | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    apiGet<UserBrief[]>('/api/users').then(setUsers).catch(() => setUsers([]));
  }, [refresh]);

  return (
    <>
      <PageHeader
        eyebrow="Administración · Acceso"
        title="Usuarios del sistema"
        subtitle="Gestión de cuentas y roles. Acceso restringido al rol administrador (RN-08)."
        actions={<Button onClick={() => setCreating(true)}>+ Nuevo usuario</Button>}
      />

      {users === null ? (
        <SkeletonTable rows={4} cols={5} />
      ) : users.length === 0 ? (
        <EmptyState glyph="∅" title="Sin usuarios" />
      ) : (
        <Panel padded={false}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Creado</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 grid place-items-center text-[0.65rem] font-medium text-slate-300 ring-1 ring-white/10">
                        {u.name.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="text-slate-100">{u.name}</span>
                    </div>
                  </td>
                  <td className="mono text-xs text-slate-400">{u.email}</td>
                  <td>
                    <StatusDot color={ROLE_COLOR[u.role]} label={u.role} />
                  </td>
                  <td className="text-xs text-slate-500 tabular-nums">{formatDate(u.created_at)}</td>
                  <td>
                    {u.is_active ? (
                      <StatusDot color="emerald" label="activo" />
                    ) : (
                      <StatusDot color="slate" label="inactivo" />
                    )}
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => setEditing(u)}
                      className="text-amber-300 text-xs hover:text-amber-200 transition-colors"
                    >
                      Editar →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {creating && (
        <NewUserModal
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            setRefresh((r) => r + 1);
          }}
        />
      )}
      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setRefresh((r) => r + 1);
          }}
        />
      )}
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
    <Modal title="Nuevo usuario" eyebrow="Administración · Acceso" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre completo">
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Email">
          <input
            className="input mono"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Rol">
          <select className="select" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="admin">Administrador</option>
            <option value="vendedor">Vendedor</option>
            <option value="bodeguero">Bodeguero</option>
            <option value="conductor">Conductor</option>
          </select>
        </Field>
        <Field label="Contraseña inicial">
          <input
            className="input"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {err && <p className="text-rose-400 text-sm">{err}</p>}
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Creando…' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: UserBrief;
  onClose: () => void;
  onSaved: () => void;
}) {
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
    <Modal title={user.email} eyebrow="Editar usuario" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Rol">
          <select className="select" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="admin">Administrador</option>
            <option value="vendedor">Vendedor</option>
            <option value="bodeguero">Bodeguero</option>
            <option value="conductor">Conductor</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="accent-amber-500"
          />
          Cuenta activa
        </label>
        <Field label="Nueva contraseña (vacío = mantener)">
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        {err && <p className="text-rose-400 text-sm">{err}</p>}
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      {children}
    </label>
  );
}
