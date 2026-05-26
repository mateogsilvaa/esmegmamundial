'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { GROUP_IDS, getTeamsByGroup, getTeamById } from '@/lib/data/teams';
import { getMatchesByGroup } from '@/lib/data/matches';
import { computeGroupStandings, formatMatchDate, cn } from '@/lib/utils';
import { Flag } from '@/components/ui/Flag';
import { ScoreInput } from '@/components/ui/ScoreInput';

interface Props {
  matchPreds: Record<string, { homeScore: number; awayScore: number }>;
  qualifiedSlots: Record<string, string | null>;
  onScoreChange: (matchId: string, h: number, a: number) => void;
  locked: boolean;
  onResetGroups?: () => void;
}

export function GroupsTab({ matchPreds, qualifiedSlots, onScoreChange, locked, onResetGroups }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    A: true, B: true, C: true, D: true,
  });

  const toggle = (gId: string) => setExpanded(p => ({ ...p, [gId]: !p[gId] }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-zinc-900">Fase de grupos</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Predice los marcadores de cada partido</p>
        </div>
        {onResetGroups && (
          <button onClick={onResetGroups} className="btn-ghost text-red-600 text-xs gap-1">
            <RotateCcw size={12} />
            Reiniciar grupos
          </button>
        )}
      </div>

      {/* Best thirds info */}
      <div className="card px-4 py-3 mb-6 bg-zinc-50 border-zinc-200">
        <p className="text-xs text-zinc-500">
          <strong className="text-zinc-700">Mejor tercero de cada grupo</strong> —
          Los 8 mejores terceros se calculan automáticamente por puntos, diferencia de goles y goles marcados.
          No necesitas seleccionarlos.
        </p>
        {Object.keys(matchPreds).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {[1,2,3,4,5,6,7,8].map(i => {
              const teamId = qualifiedSlots[`T${i}`];
              const team = teamId ? getTeamById(teamId) : null;
              return team ? (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-zinc-200 rounded-full text-xs font-medium text-zinc-700">
                  <Flag code={team.code} name={team.name} size="xs" rounded />
                  {team.shortName}
                </span>
              ) : (
                <span key={i} className="inline-flex items-center px-2 py-0.5 bg-zinc-200 rounded-full text-xs text-zinc-400">T{i}</span>
              );
            })}
          </div>
        )}
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {GROUP_IDS.map(gId => {
          const teams = getTeamsByGroup(gId);
          const matches = getMatchesByGroup(gId);
          const standings = computeGroupStandings(gId, matchPreds);
          const isOpen = expanded[gId] !== false;

          return (
            <div key={gId} className="card overflow-hidden">
              {/* Group header */}
              <button
                onClick={() => toggle(gId)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-lg text-zinc-900">Grupo {gId}</span>
                  <div className="flex items-center gap-1">
                    {standings.slice(0, 2).map(s => {
                      const t = teams.find(x => x.id === s.teamId);
                      return t ? <Flag key={t.id} code={t.code} name={t.name} emoji={t.flag} size="xs" rounded /> : null;
                    })}
                  </div>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-zinc-100">
                  {/* Mini standings */}
                  <div className="px-4 py-3 bg-zinc-50/50 border-b border-zinc-100">
                    <div className="grid grid-cols-4 gap-1">
                      {standings.map((s, idx) => {
                        const team = teams.find(t => t.id === s.teamId);
                        const qualifier = idx < 2 ? 'border-l-2 border-green-500' : '';
                        return (
                          <div key={s.teamId} className={cn('flex items-center gap-1.5 pl-1.5', qualifier)}>
                            <span className="text-xs text-zinc-400 w-3">{idx + 1}</span>
                            {team && <Flag code={team.code} name={team.name} emoji={team.flag} size="xs" rounded />}
                            <span className="text-xs font-medium text-zinc-700 hidden lg:block truncate">{team?.shortName}</span>
                            <span className="tabular text-xs font-bold text-zinc-900 ml-auto">{s.pts}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Matches */}
                  <div className="divide-y divide-zinc-100">
                    {matches.map(match => {
                      const home = match.homeTeam;
                      const away = match.awayTeam;
                      const pred = matchPreds[match.id] ?? { homeScore: 0, awayScore: 0 };
                      const hasPred = !!matchPreds[match.id];

                      return (
                        <div key={match.id} className={cn('px-4 py-3', !hasPred && !locked && 'bg-amber-50/30')}>
                          <p className="text-xs text-zinc-400 mb-2">{formatMatchDate(match.scheduledAt)} · {match.venue}</p>
                          <div className="flex items-center gap-3">
                            {/* Home */}
                            <div className="flex-1 flex items-center gap-2 justify-end">
                              <span className="text-sm font-semibold text-zinc-900 text-right truncate">
                                <span className="hidden sm:inline">{home?.name}</span>
                                <span className="sm:hidden">{home?.shortName}</span>
                              </span>
                              {home && <Flag code={home.code} name={home.name} emoji={home.flag} size="sm" rounded />}
                            </div>

                            {/* Scores */}
                            <div className="flex items-center gap-1.5">
                              <ScoreInput
                                value={hasPred ? pred.homeScore : ''}
                                onChange={v => onScoreChange(match.id, v, pred.awayScore)}
                                disabled={locked}
                                size="md"
                              />
                              <span className="text-zinc-400 text-sm font-light select-none">–</span>
                              <ScoreInput
                                value={hasPred ? pred.awayScore : ''}
                                onChange={v => onScoreChange(match.id, pred.homeScore, v)}
                                disabled={locked}
                                size="md"
                              />
                            </div>

                            {/* Away */}
                            <div className="flex-1 flex items-center gap-2">
                              {away && <Flag code={away.code} name={away.name} emoji={away.flag} size="sm" rounded />}
                              <span className="text-sm font-semibold text-zinc-900 truncate">
                                <span className="hidden sm:inline">{away?.name}</span>
                                <span className="sm:hidden">{away?.shortName}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
