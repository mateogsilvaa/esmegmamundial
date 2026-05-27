import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from './ProfileForm';

export default async function PerfilPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: leaderEntry } = await supabase
    .from('leaderboard')
    .select('total_points, rank')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <div className="page max-w-lg mx-auto">
      <h1 className="font-display text-3xl font-bold text-zinc-900 mb-6">Mi perfil</h1>

      {leaderEntry && (
        <div className="card p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Posición actual</p>
            <p className="text-2xl font-bold text-zinc-900 tabular">#{leaderEntry.rank ?? '–'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 mb-0.5">Puntos</p>
            <p className="text-2xl font-bold text-zinc-900 tabular">{leaderEntry.total_points ?? 0}</p>
          </div>
        </div>
      )}

      <ProfileForm
        userId={user.id}
        initialProfile={{
          username:            profile?.username            ?? '',
          displayName:         profile?.display_name        ?? '',
          country:             profile?.country             ?? '',
          favoriteTeamId:      profile?.favorite_team_id    ?? '',
          isPublic:            profile?.is_public           ?? true,
          isPredictionsPublic: profile?.is_predictions_public ?? true,
          avatarUrl:           profile?.avatar_url          ?? null,
        }}
      />
    </div>
  );
}
