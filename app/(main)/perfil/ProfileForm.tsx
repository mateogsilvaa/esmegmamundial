'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, LogOut, Trash2, Camera } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TEAMS } from '@/lib/data/teams';
import { Flag } from '@/components/ui/Flag';
import { cn } from '@/lib/utils';

interface ProfileFormProps {
  userId: string;
  initialProfile: {
    username:            string;
    displayName:         string;
    country:             string;
    favoriteTeamId:      string;
    isPublic:            boolean;
    isPredictionsPublic: boolean;
    avatarUrl:           string | null;
  };
}

export function ProfileForm({ userId, initialProfile }: ProfileFormProps) {
  const router    = useRouter();
  const fileRef   = useRef<HTMLInputElement>(null);

  const [form,         setForm]         = useState(initialProfile);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile.avatarUrl);
  const [saving,       setSaving]       = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [loggingOut,   setLoggingOut]   = useState(false);
  const [resetting,    setResetting]    = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    setForm(f => ({ ...f, [key]: value }));
  };

  // ── Avatar upload ──────────────────────────────────────────────────────────

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor de 2 MB');
      return;
    }

    // Local preview
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const supabase = createClient();
    const ext  = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (upErr) {
      toast.error('Error al subir imagen: ' + upErr.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const publicUrl = data.publicUrl + `?t=${Date.now()}`; // cache-bust

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    setUploading(false);
    if (updateErr) {
      toast.error('Error al guardar avatar');
    } else {
      setForm(f => ({ ...f, avatarUrl: publicUrl }));
      toast.success('Foto actualizada');
      router.refresh();
    }
  };

  // ── Save profile ──────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('profiles')
      .update({
        username:              form.username,
        display_name:          form.displayName || form.username,
        country:               form.country || null,
        favorite_team_id:      form.favoriteTeamId || null,
        is_public:             form.isPublic,
        is_predictions_public: form.isPredictionsPublic,
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

  // ── Logout ────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // ── Reset predictions ─────────────────────────────────────────────────────

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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="card p-5 flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-zinc-100 overflow-hidden flex items-center justify-center border border-zinc-200">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-zinc-300">
                {(form.username || '?')[0].toUpperCase()}
              </span>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
              <Loader2 size={16} className="text-white animate-spin" />
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-zinc-900">Foto de perfil</p>
          <p className="text-xs text-zinc-500 mb-2">JPG o PNG, máx. 2 MB</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-secondary text-xs py-1.5 gap-1.5"
          >
            <Camera size={13} />
            Cambiar foto
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Main form */}
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
            value={form.favoriteTeamId}
            onChange={set('favoriteTeamId')}
            className="input"
          >
            <option value="">– Ninguno –</option>
            {TEAMS.map(t => (
              <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2 pt-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={set('isPublic')}
              className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <div>
              <p className="text-sm font-medium text-zinc-700">Perfil público</p>
              <p className="text-xs text-zinc-500">Tu perfil es visible desde el ranking</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPredictionsPublic}
              onChange={set('isPredictionsPublic')}
              className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <div>
              <p className="text-sm font-medium text-zinc-700">Predicciones públicas</p>
              <p className="text-xs text-zinc-500">Otros pueden ver tus predicciones detalladas</p>
            </div>
          </label>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
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
