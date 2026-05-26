import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getTeamsByGroup, GROUP_IDS } from '@/lib/data/teams';
import { getMatchesByGroup } from '@/lib/data/matches';
import { calculateGroupStandings } from '@/lib/utils';
import { Flag } from '@/components/ui/Flag';
import { cn } from '@/lib/utils';

export const revalidate = 60;

export default async function GruposPage() {
  const supabase = createClient();

  // Fetch all finished match results
  const { data: dbMatches } = await supabase
    .from('matches')
    .select('id, home_team_id, away_team_id, home_score, away_score, status')
    .eq('phase', 'group');

  const resultMap: Record<string, { homeScore: number | null; awayScore: number | null; status: string }> = {};
  for (const m of dbMatches ?? []) {
    resultMap[m.id] = { homeScore: m.home_score, awayScore: m.away_score, status: m.status };
  }

  return (
    <div className="page">
      <h1 className="font-display text-3xl font-bold text-zinc-900 mb-6">Fase de grupos</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GROUP_IDS.map(gId => {
          const teams = getTeamsByGroup(gId);
          const staticMatches = getMatchesByGroup(gId);

          // Merge static data with official results
          const matches = staticMatches.map(m => ({
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            homeScore: resultMap[m.id]?.homeScore ?? null,
            awayScore: resultMap[m.id]?.awayScore ?? null,
            status: resultMap[m.id]?.status ?? 'scheduled',
          }));

          const standings = calculateGroupStandings(teams, matches);
          const hasResults = matches.some(m => m.status === 'finished');

          return (
            <Link
              key={gId}
              href={`/grupos/${gId.toLowerCase()}`}
              className="card-hover p-4 block group"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-bold text-lg tracking-tight text-zinc-900">
                  Grupo {gId}
                </h2>
                {hasResults && (
                  <span className="text-xs text-zinc-400">En juego</span>
                )}
              </div>

              <div className="space-y-1.5">
                {standings.map((s, idx) => (
                  <div key={s.teamId} className="flex items-center gap-2">
                    <span className={cn(
                      'text-xs font-bold w-4 text-right flex-shrink-0',
                      idx < 2 ? 'text-zinc-900' : 'text-zinc-400',
                    )}>
                      {idx + 1}
                    </span>
                    <Flag code={teams.find(t => t.id === s.teamId)?.code ?? ''} name={teams.find(t => t.id === s.teamId)?.name} size="xs" rounded />
                    <span className={cn(
                      'text-sm flex-1 truncate',
                      idx < 2 ? 'font-medium text-zinc-900' : 'text-zinc-500',
                    )}>
                      {teams.find(t => t.id === s.teamId)?.name}
                    </span>
                    {hasResults && (
                      <span className="tabular text-xs text-zinc-500 font-medium">{s.pts}</span>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-zinc-400 mt-3 group-hover:text-zinc-600 transition-colors">
                Ver partidos →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
