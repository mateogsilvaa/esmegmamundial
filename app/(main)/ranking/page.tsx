import { createClient } from '@/lib/supabase/server';
import { getTeamById } from '@/lib/data/teams';
import { Flag } from '@/components/ui/Flag';
import { cn } from '@/lib/utils';

export const revalidate = 60;

export default async function RankingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: leaders } = await supabase
    .from('leaderboard')
    .select(`
      user_id, total_points, rank, previous_rank,
      exact_score_pts, correct_result_pts, group_position_pts,
      knockout_pts, champion_pts,
      profiles(username, display_name, country, favorite_team, is_public)
    `)
    .order('rank', { ascending: true })
    .limit(100);

  return (
    <div className="page max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-zinc-900">Ranking</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {leaders?.length ?? 0} participantes
        </p>
      </div>

      {(!leaders || leaders.length === 0) ? (
        <div className="card p-12 text-center">
          <p className="text-zinc-400 text-sm">El ranking estará disponible cuando empiecen los partidos</p>
        </div>
      ) : (
        <div className="card divide-y divide-zinc-100">
          {leaders.map((entry, i) => {
            const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
            const favTeam = profile?.favorite_team ? getTeamById(profile.favorite_team) : null;
            const isMe = entry.user_id === user?.id;
            const rankChange = entry.previous_rank ? entry.previous_rank - (entry.rank ?? 0) : 0;

            return (
              <div
                key={entry.user_id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 transition-colors',
                  isMe && 'bg-amber-50/60',
                )}
              >
                {/* Rank */}
                <div className="flex items-center gap-1 w-8 flex-shrink-0">
                  <span className={cn(
                    'tabular text-sm font-bold',
                    i === 0 ? 'text-amber-500' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-amber-700' : 'text-zinc-400',
                  )}>
                    {i + 1}
                  </span>
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {favTeam ? (
                    <Flag code={favTeam.code} name={favTeam.name} size="sm" />
                  ) : (
                    <span className="text-xs font-bold text-zinc-400">
                      {(profile?.username ?? '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm truncate', isMe ? 'font-bold text-zinc-900' : 'font-medium text-zinc-900')}>
                    {profile?.display_name || profile?.username || '–'}
                    {isMe && <span className="text-amber-600 font-normal ml-1.5 text-xs">← tú</span>}
                  </p>
                  {profile?.country && (
                    <p className="text-xs text-zinc-400 truncate">{profile.country}</p>
                  )}
                </div>

                {/* Rank change */}
                {rankChange !== 0 && (
                  <span className={cn(
                    'text-xs font-medium flex-shrink-0',
                    rankChange > 0 ? 'text-green-600' : 'text-red-500',
                  )}>
                    {rankChange > 0 ? `↑${rankChange}` : `↓${Math.abs(rankChange)}`}
                  </span>
                )}

                {/* Points */}
                <div className="flex-shrink-0 text-right">
                  <span className="tabular text-sm font-bold text-zinc-900">{entry.total_points}</span>
                  <span className="text-xs text-zinc-400 ml-0.5">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
