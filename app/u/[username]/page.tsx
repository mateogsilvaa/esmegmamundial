import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTeamById, GROUP_IDS } from '@/lib/data/teams';
import { Flag } from '@/components/ui/Flag';
import type { GroupOrders } from '@/lib/groupPrediction';

interface PageProps {
  params: { username: string };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const supabase = createClient();
  const username = decodeURIComponent(params.username);

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, country, favorite_team_id, is_public, is_predictions_public')
    .eq('username', username)
    .maybeSingle();

  if (!profile || !profile.is_public) notFound();

  // Fetch leaderboard entry
  const { data: lb } = await supabase
    .from('leaderboard')
    .select('total_points, rank, group_pts, bracket_pts, bonus_score')
    .eq('user_id', profile.id)
    .maybeSingle();

  const favTeam = profile.favorite_team_id ? getTeamById(profile.favorite_team_id) : null;

  // Fetch predictions if public
  let groupOrders: GroupOrders = {};
  let bracketPreds: Record<string, string | null> = {};

  if (profile.is_predictions_public) {
    const [{ data: groupRows }, { data: bracketRows }] = await Promise.all([
      supabase.from('group_order_predictions').select('group_id, team_order').eq('user_id', profile.id),
      supabase.from('bracket_predictions').select('slot, team_id').eq('user_id', profile.id),
    ]);

    for (const gId of GROUP_IDS) {
      groupOrders[gId] = [null, null, null, null];
    }
    for (const row of groupRows ?? []) {
      const order = (row.team_order as string[]) ?? [];
      groupOrders[row.group_id] = [
        order[0] ?? null,
        order[1] ?? null,
        order[2] ?? null,
        order[3] ?? null,
      ];
    }

    for (const p of bracketRows ?? []) {
      bracketPreds[p.slot] = p.team_id ?? null;
    }
  }

  const completedGroups = GROUP_IDS.filter(gId => {
    const order = groupOrders[gId];
    return order && order.every(t => t !== null);
  });

  return (
    <div className="page max-w-2xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-zinc-100 overflow-hidden flex items-center justify-center border border-zinc-200 flex-shrink-0">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-zinc-300">
              {(profile.username)[0].toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-bold text-zinc-900 truncate">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-sm text-zinc-500">@{profile.username}</p>
          {profile.country && <p className="text-xs text-zinc-400 mt-0.5">{profile.country}</p>}
          {favTeam && (
            <div className="flex items-center gap-1.5 mt-1">
              <Flag code={favTeam.code} name={favTeam.name} emoji={favTeam.flag} size="xs" rounded />
              <span className="text-xs text-zinc-500">{favTeam.name}</span>
            </div>
          )}
        </div>

        {lb && (
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-zinc-900 tabular">#{lb.rank ?? '–'}</p>
            <p className="text-sm font-semibold text-zinc-600 tabular">{lb.total_points} pts</p>
          </div>
        )}
      </div>

      {/* ── Score breakdown ── */}
      {lb && (
        <div className="card p-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            Desglose de puntos
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Grupos',       value: lb.group_pts   ?? 0 },
              { label: 'Bracket',      value: lb.bracket_pts ?? 0 },
              { label: 'Bonus score',  value: lb.bonus_score ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="bg-zinc-50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-zinc-900 tabular">{value}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Predictions ── */}
      {!profile.is_predictions_public ? (
        <div className="card p-6 text-center">
          <p className="text-zinc-400 text-sm">Este usuario mantiene sus predicciones privadas</p>
        </div>
      ) : completedGroups.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-zinc-400 text-sm">Aún no ha hecho predicciones de grupo</p>
        </div>
      ) : (
        <>
          {/* Group predictions */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-100">
              <p className="font-semibold text-zinc-900">Predicción de grupos</p>
              <p className="text-xs text-zinc-500">{completedGroups.length}/12 grupos completados</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
              {GROUP_IDS.map(gId => {
                const ranking = groupOrders[gId] ?? [];
                if (!ranking.some(Boolean)) return null;
                return (
                  <div key={gId} className="px-4 py-3">
                    <p className="text-xs font-bold text-zinc-500 mb-1.5">Grupo {gId}</p>
                    <div className="space-y-1">
                      {ranking.map((teamId, idx) => {
                        const team = teamId ? getTeamById(teamId) : null;
                        return (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className={`text-xs font-bold w-4 text-right flex-shrink-0 ${idx < 2 ? 'text-green-600' : 'text-zinc-400'}`}>
                              {idx + 1}º
                            </span>
                            {team ? (
                              <>
                                <Flag code={team.code} name={team.name} emoji={team.flag} size="xs" rounded />
                                <span className="text-zinc-800 truncate">{team.shortName}</span>
                              </>
                            ) : (
                              <span className="text-zinc-400 italic text-xs">–</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bracket picks */}
          {Object.keys(bracketPreds).length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-100">
                <p className="font-semibold text-zinc-900">Bracket</p>
                <p className="text-xs text-zinc-500">
                  {Object.values(bracketPreds).filter(Boolean).length} picks · 5 pts por ganador
                </p>
              </div>
              <div className="px-4 py-3 flex flex-wrap gap-2">
                {Object.entries(bracketPreds)
                  .filter(([, tid]) => Boolean(tid))
                  .sort(([a], [b]) => {
                    const n = (s: string) => parseInt(s.slice(1));
                    return n(a) - n(b);
                  })
                  .map(([slot, teamId]) => {
                    const team = teamId ? getTeamById(teamId) : null;
                    if (!team) return null;
                    return (
                      <div key={slot} className="flex items-center gap-1 bg-zinc-50 rounded-full px-2.5 py-1 text-xs">
                        <Flag code={team.code} name={team.name} emoji={team.flag} size="xs" rounded />
                        <span className="font-medium text-zinc-700">{team.shortName}</span>
                        <span className="text-zinc-400">{slot}</span>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
