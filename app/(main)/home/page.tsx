import Link from 'next/link';
import { Trophy, Users, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Flag } from '@/components/ui/Flag';
import { getTeamById } from '@/lib/data/teams';
import { isPredictionLocked, formatRelativeDate } from '@/lib/utils';
import { TOURNAMENT_START } from '@/lib/types';
import { cn } from '@/lib/utils';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Top 10 leaderboard
  const { data: leaders } = await supabase
    .from('leaderboard')
    .select('user_id, total_points, rank, profiles(username, display_name, country, favorite_team)')
    .order('rank', { ascending: true })
    .limit(10);

  // Current user's rank
  const { data: myEntry } = user ? await supabase
    .from('leaderboard')
    .select('total_points, rank')
    .eq('user_id', user.id)
    .single() : { data: null };

  const locked = isPredictionLocked();
  const tournamentStarted = new Date() > TOURNAMENT_START;

  return (
    <div className="page max-w-2xl mx-auto">
      {/* Status banner */}
      {locked ? (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium mb-6">
          <Lock size={15} />
          <span>Las predicciones están bloqueadas · El torneo ha comenzado</span>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 text-sm mb-6">
          <span>Torneo empieza el <strong>11 jun · 22:00</strong></span>
          <Link href="/prediccion" className="text-zinc-900 font-semibold hover:underline">
            Hacer predicción →
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link
          href="/prediccion"
          className={cn(
            'card-hover p-5 flex flex-col gap-3',
            locked && 'opacity-70',
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
            <Trophy size={20} className="text-zinc-700" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 text-sm">Mi predicción</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {locked ? 'Ver mis picks' : 'Editar y guardar'}
            </p>
          </div>
        </Link>

        <Link href="/grupos" className="card-hover p-5 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
            <Users size={20} className="text-zinc-700" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 text-sm">Grupos y partidos</p>
            <p className="text-xs text-zinc-500 mt-0.5">12 grupos · 72 partidos</p>
          </div>
        </Link>
      </div>

      {/* My rank if out of top 10 */}
      {myEntry && myEntry.rank > 10 && (
        <div className="card px-4 py-3 flex items-center justify-between mb-4 bg-zinc-900 text-white border-0">
          <div className="flex items-center gap-3">
            <span className="tabular text-sm font-bold text-zinc-400">#{myEntry.rank}</span>
            <span className="text-sm font-medium">Tú</span>
          </div>
          <span className="tabular text-sm font-bold">{myEntry.total_points} pts</span>
        </div>
      )}

      {/* Leaderboard */}
      <div>
        <p className="section-title">Clasificación</p>

        {(!leaders || leaders.length === 0) ? (
          <div className="card p-8 text-center">
            <p className="text-zinc-500 text-sm">Aún no hay puntuaciones</p>
          </div>
        ) : (
          <div className="card divide-y divide-zinc-100">
            {leaders.map((entry, i) => {
              const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
              const favTeam = profile?.favorite_team ? getTeamById(profile.favorite_team) : null;
              const isMe = entry.user_id === user?.id;

              return (
                <div
                  key={entry.user_id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3',
                    isMe && 'bg-zinc-50',
                  )}
                >
                  <span className={cn(
                    'tabular text-sm font-bold w-6 text-right flex-shrink-0',
                    i === 0 ? 'text-amber-500' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-amber-700' : 'text-zinc-400',
                  )}>
                    {i + 1}
                  </span>

                  {/* Avatar placeholder or flag */}
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {favTeam ? (
                      <Flag code={favTeam.code} name={favTeam.name} size="sm" />
                    ) : (
                      <span className="text-xs font-bold text-zinc-400">
                        {(profile?.username ?? '?')[0].toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium truncate', isMe && 'font-semibold')}>
                      {profile?.display_name || profile?.username || '–'}
                      {isMe && <span className="text-zinc-400 font-normal ml-1.5">· tú</span>}
                    </p>
                    {profile?.country && (
                      <p className="text-xs text-zinc-400">{profile.country}</p>
                    )}
                  </div>

                  <span className="tabular text-sm font-bold text-zinc-900 flex-shrink-0">
                    {entry.total_points}
                    <span className="text-zinc-400 font-normal text-xs ml-0.5">pts</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {leaders && leaders.length > 0 && (
          <Link href="/ranking" className="mt-3 block text-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors py-2">
            Ver ranking completo →
          </Link>
        )}
      </div>
    </div>
  );
}
