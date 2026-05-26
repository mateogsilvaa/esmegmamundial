import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTeamsByGroup, GROUP_IDS, getTeamById } from '@/lib/data/teams';
import { getMatchesByGroup } from '@/lib/data/matches';
import { calculateGroupStandings, formatMatchDate, cn } from '@/lib/utils';
import { Flag } from '@/components/ui/Flag';

export const revalidate = 30;

interface Props {
  params: { slug: string };
}

export default async function GroupDetailPage({ params }: Props) {
  const gId = params.slug.toUpperCase();
  if (!GROUP_IDS.includes(gId as typeof GROUP_IDS[number])) notFound();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const teams = getTeamsByGroup(gId);
  const staticMatches = getMatchesByGroup(gId);

  // Official results from DB
  const { data: dbMatches } = await supabase
    .from('matches')
    .select('id, home_score, away_score, status')
    .in('id', staticMatches.map(m => m.id));

  const resultMap: Record<string, { homeScore: number | null; awayScore: number | null; status: string }> = {};
  for (const m of dbMatches ?? []) {
    resultMap[m.id] = { homeScore: m.home_score, awayScore: m.away_score, status: m.status };
  }

  // User's score predictions for this group
  const { data: userPreds } = user ? await supabase
    .from('predictions')
    .select('match_id, home_score, away_score')
    .eq('user_id', user.id)
    .in('match_id', staticMatches.map(m => m.id)) : { data: [] };

  const predMap: Record<string, { homeScore: number; awayScore: number }> = {};
  for (const p of userPreds ?? []) {
    predMap[p.match_id] = { homeScore: p.home_score, awayScore: p.away_score };
  }

  const mergedMatches = staticMatches.map(m => ({
    ...m,
    homeScore: resultMap[m.id]?.homeScore ?? null,
    awayScore: resultMap[m.id]?.awayScore ?? null,
    status: (resultMap[m.id]?.status ?? 'scheduled') as 'scheduled' | 'live' | 'finished' | 'postponed',
  }));

  const standings = calculateGroupStandings(teams, mergedMatches);

  // Group by matchday
  const byMatchday: Record<number, typeof mergedMatches> = {};
  for (const m of mergedMatches) {
    const md = m.matchday ?? 1;
    byMatchday[md] = [...(byMatchday[md] ?? []), m];
  }

  return (
    <div className="page max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-zinc-900">Grupo {gId}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{teams.map(t => t.name).join(' · ')}</p>
        </div>
      </div>

      {/* Standings table */}
      <div className="card mb-6 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Clasificación</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-zinc-400 border-b border-zinc-100">
                <th className="text-left px-4 py-2 font-medium w-6">#</th>
                <th className="text-left px-2 py-2 font-medium">Equipo</th>
                <th className="tabular text-center px-2 py-2 font-medium">PJ</th>
                <th className="tabular text-center px-2 py-2 font-medium">G</th>
                <th className="tabular text-center px-2 py-2 font-medium">E</th>
                <th className="tabular text-center px-2 py-2 font-medium">P</th>
                <th className="tabular text-center px-2 py-2 font-medium">GD</th>
                <th className="tabular text-center px-2 py-2 font-medium font-bold text-zinc-900">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {standings.map((s, idx) => {
                const team = teams.find(t => t.id === s.teamId);
                return (
                  <tr key={s.teamId} className={cn(idx < 2 && 'bg-zinc-50/50')}>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-xs font-bold',
                        idx < 2 ? 'text-zinc-700' : 'text-zinc-400',
                      )}>{idx + 1}</span>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        {team && <Flag code={team.code} name={team.name} emoji={team.flag} size="sm" rounded />}
                        <span className={cn('font-medium', idx < 2 ? 'text-zinc-900' : 'text-zinc-600')}>
                          <span className="hidden sm:inline">{team?.name}</span>
                          <span className="sm:hidden">{team?.shortName}</span>
                        </span>
                      </div>
                    </td>
                    <td className="tabular text-center px-2 py-3 text-zinc-600">{s.played}</td>
                    <td className="tabular text-center px-2 py-3 text-zinc-600">{s.won}</td>
                    <td className="tabular text-center px-2 py-3 text-zinc-600">{s.drawn}</td>
                    <td className="tabular text-center px-2 py-3 text-zinc-600">{s.lost}</td>
                    <td className="tabular text-center px-2 py-3 text-zinc-600">
                      {s.gd > 0 ? `+${s.gd}` : s.gd}
                    </td>
                    <td className="tabular text-center px-2 py-3 font-bold text-zinc-900">{s.pts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Matches by matchday */}
      {[1, 2, 3].map(md => {
        const matches = byMatchday[md] ?? [];
        return (
          <div key={md} className="mb-6">
            <p className="section-title">Jornada {md}</p>
            <div className="space-y-3">
              {matches.map(match => {
                const home = match.homeTeam;
                const away = match.awayTeam;
                const finished = match.status === 'finished';
                const live = match.status === 'live';
                const myPred = predMap[match.id];

                return (
                  <div key={match.id} className={cn('card p-4', live && 'border-red-200 bg-red-50/30')}>
                    {/* Status / date */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-zinc-400">{formatMatchDate(match.scheduledAt)}</span>
                      {live && (
                        <span className="badge-live">
                          <span className="live-dot w-1.5 h-1.5" />
                          EN VIVO
                        </span>
                      )}
                      {finished && (
                        <span className="text-xs font-medium text-zinc-500">Finalizado</span>
                      )}
                    </div>

                    {/* Match */}
                    <div className="flex items-center gap-4">
                      {/* Home team */}
                      <div className="flex-1 flex items-center gap-2 justify-end">
                        <span className="text-sm font-semibold text-zinc-900 text-right">
                          <span className="hidden sm:inline">{home?.name}</span>
                          <span className="sm:hidden">{home?.shortName}</span>
                        </span>
                        {home && <Flag code={home.code} name={home.name} emoji={home.flag} size="sm" rounded />}
                      </div>

                      {/* Score */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {finished || live ? (
                          <>
                            <span className="tabular text-xl font-bold text-zinc-900 w-7 text-center">{match.homeScore}</span>
                            <span className="text-zinc-400 font-light">–</span>
                            <span className="tabular text-xl font-bold text-zinc-900 w-7 text-center">{match.awayScore}</span>
                          </>
                        ) : (
                          <span className="text-sm text-zinc-400 font-medium px-2">vs</span>
                        )}
                      </div>

                      {/* Away team */}
                      <div className="flex-1 flex items-center gap-2">
                        {away && <Flag code={away.code} name={away.name} emoji={away.flag} size="sm" rounded />}
                        <span className="text-sm font-semibold text-zinc-900">
                          <span className="hidden sm:inline">{away?.name}</span>
                          <span className="sm:hidden">{away?.shortName}</span>
                        </span>
                      </div>
                    </div>

                    {/* User prediction */}
                    {myPred && (
                      <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-center gap-2">
                        <span className="text-xs text-zinc-400">Tu predicción:</span>
                        <span className="tabular text-xs font-bold text-zinc-700">
                          {myPred.homeScore} – {myPred.awayScore}
                        </span>
                      </div>
                    )}

                    {/* Venue */}
                    <p className="text-xs text-zinc-400 text-center mt-2">{match.venue}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
