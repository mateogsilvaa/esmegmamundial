'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, LogOut, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TEAMS } from '@/lib/data/teams';
import { Flag } from '@/components/ui/Flag';
import { cn } from '@/lib/utils';

interface ProfileFormProps {
  userId: string;
  initialProfile: {
    username: string;
    displayName: string;
    country: string;
    favoriteTeam: string;
    isPublic: boolean;
  };
}

export function ProfileForm({ userId, initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('profiles')
      .update({
        username: form.username,
        display_name: form.displayName || form.username,
        country: form.country || null,
        favorite_team: form.favoriteTeam || null,
        is_public: form.isPublic,
      })
      .eq('id', userId);

    setSaving(false);
    if (error) {
      toast.error('Error al guardar: ' + error.message);
    } else {
      toast.success('Perfil guardado');
      router.refresh();
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleReset = async () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    setResetting(true);
    const res = await fetch('/api/predictions/reset', { method: 'POST' });
    setResetting(false);
    setConfirmReset(false);
    if (res.ok) {
      toast.success('Predicciones borradas');
      router.refresh();
    } else {
      toast.error('Error al borrar predicciones');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="card p-5 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Nombre de usuario</label>
          <input
            type="text"
            value={form.username}
            onChange={set('username')}
            className="input"
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Nombre a mostrar</label>
          <input
            type="text"
            value={form.displayName}
            onChange={set('displayName')}
            className="input"
            maxLength={40}
            placeholder={form.username}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">País</label>
          <input
            type="text"
            value={form.country}
            onChange={set('country')}
            className="input"
            placeholder="España"
            maxLength={40}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Equipo favorito</label>
          <select
            value={form.favoriteTeam}
            onChange={set('favoriteTeam')}
            className="input"
          >
            <option value="">– Ninguno –</option>
            {TEAMS.map(t => (
              <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={set('isPublic')}
            className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
          />
          <div>
            <p className="text-sm font-medium text-zinc-700">Perfil público</p>
            <p className="text-xs text-zinc-500">Otros pueden ver tus predicciones</p>
          </div>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>

      {/* Danger zone */}
      <div className="card p-5 space-y-3 border-red-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-1">Zona de peligro</p>

        <button
          onClick={handleReset}
          disabled={resetting}
          className={cn(
            'btn-secondary w-full border-red-200 text-red-700 hover:bg-red-50',
            confirmReset && 'border-red-400 bg-red-50',
          )}
        >
          {resetting && <Loader2 size={15} className="animate-spin" />}
          <Trash2 size={15} />
          {confirmReset
            ? '¿Seguro? Haz clic de nuevo para borrar TODO'
            : 'Restablecer todas las predicciones'}
        </button>
        {confirmReset && (
          <button
            onClick={() => setConfirmReset(false)}
            className="btn-ghost w-full text-zinc-500"
          >
            Cancelar
          </button>
        )}

        <button onClick={handleLogout} disabled={loggingOut} className="btn-ghost w-full">
          {loggingOut && <Loader2 size={15} className="animate-spin" />}
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
