'use client';

import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { getTeamById } from '@/lib/data/teams';
import { Flag } from '@/components/ui/Flag';
import { cn } from '@/lib/utils';
import {
  areAllGroupsComplete,
  getThirdsByGroupOrdered,
  isThirdsComplete,
  type GroupOrders,
  type ThirdsRanking,
} from '@/lib/groupPrediction';

interface Props {
  groupOrders: GroupOrders;
  thirdsRanking: ThirdsRanking;
  onChange: (ranking: ThirdsRanking) => void;
  locked: boolean;
}

export function ThirdsTab({ groupOrders, thirdsRanking, onChange, locked }: Props) {
  const allGroupsDone = areAllGroupsComplete(groupOrders);
  const complete      = isThirdsComplete(thirdsRanking);

  // Get predicted third-place team per group (ordered A→L)
  const predictedThirds = getThirdsByGroupOrdered(groupOrders);

  // Teams available in pool (predicted thirds not yet in the ranking)
  const rankedSet  = new Set(thirdsRanking);
  const pool = predictedThirds.filter(
    pt => pt.teamId && !rankedSet.has(pt.teamId),
  );

  const handleAdd = (teamId: string) => {
    if (locked || thirdsRanking.length >= 8) return;
    onChange([...thirdsRanking, teamId]);
  };

  const handleRemove = (idx: number) => {
    if (locked) return;
    const next = thirdsRanking.filter((_, i) => i !== idx);
    onChange(next);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h2 className="font-display text-2xl font-bold text-zinc-900">Mejores terceros</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Elige los 8 mejores terceros <strong>en orden</strong> — de mejor a peor
        </p>
      </div>

      {/* Warning if groups not complete */}
      {!allGroupsDone && (
        <div className="card px-4 py-3 mb-5 border-amber-200 bg-amber-50 flex items-start gap-2">
          <AlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Primero completa el orden de todos los grupos. Los 12 terceros se obtienen
            del 3er clasificado predicho en cada grupo.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: the 8 ranked slots */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Tu ranking ({thirdsRanking.length}/8)
          </p>
          <div className="space-y-1.5">
            {Array.from({ length: 8 }, (_, idx) => {
              const teamId = thirdsRanking[idx] ?? null;
              const team   = teamId ? getTeamById(teamId) : null;
              return (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors',
                    team
                      ? 'border-zinc-200 bg-white'
                      : 'border-dashed border-zinc-200 bg-zinc-50',
                  )}
                >
                  <span className="text-xs font-bold w-5 text-center text-zinc-400 flex-shrink-0">
                    {idx + 1}
                  </span>

                  {team ? (
                    <>
                      <Flag code={team.code} name={team.name} emoji={team.flag} size="sm" rounded />
                      <span className="text-sm font-medium text-zinc-900 flex-1 truncate">
                        <span className="hidden sm:inline">{team.name}</span>
                        <span className="sm:hidden">{team.shortName}</span>
                      </span>
                      <span className="text-xs text-zinc-400 flex-shrink-0">Gr. {team.group}</span>
                      {!locked && (
                        <button
                          onClick={() => handleRemove(idx)}
                          className="text-zinc-300 hover:text-red-500 transition-colors flex-shrink-0"
                          aria-label="Quitar"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-zinc-400 italic">Posición libre</span>
                  )}
                </div>
              );
            })}
          </div>

          {complete && (
            <div className="flex items-center gap-1.5 mt-3 text-green-600">
              <CheckCircle size={15} />
              <span className="text-sm font-medium">Ranking de terceros completo</span>
            </div>
          )}
        </div>

        {/* Right: available thirds pool */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Terceros disponibles — toca para añadir
          </p>

          {!allGroupsDone ? (
            <p className="text-sm text-zinc-400 italic">
              Completa los grupos para ver los terceros disponibles.
            </p>
          ) : pool.length === 0 && thirdsRanking.length >= 8 ? (
            <p className="text-sm text-zinc-400">
              Ya has elegido los 8 mejores terceros.
            </p>
          ) : (
            <div className="space-y-1.5">
              {pool.map(({ groupId, teamId }) => {
                const team = teamId ? getTeamById(teamId) : null;
                if (!team) return null;
                return (
                  <button
                    key={team.id}
                    onClick={() => handleAdd(team.id)}
                    disabled={locked || thirdsRanking.length >= 8}
                    className={cn(
                      'w-full flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left transition-colors',
                      !locked && thirdsRanking.length < 8
                        ? 'hover:border-zinc-400 hover:bg-zinc-50 active:bg-zinc-100 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <Flag code={team.code} name={team.name} emoji={team.flag} size="sm" rounded />
                    <span className="text-sm font-medium text-zinc-900 flex-1 truncate">
                      <span className="hidden sm:inline">{team.name}</span>
                      <span className="sm:hidden">{team.shortName}</span>
                    </span>
                    <span className="text-xs text-zinc-400 flex-shrink-0">Gr. {groupId}</span>
                  </button>
                );
              })}

              {/* Show already ranked groups grayed out (so user can see they're placed) */}
              {predictedThirds
                .filter(pt => pt.teamId && rankedSet.has(pt.teamId))
                .map(({ groupId, teamId }) => {
                  const team = teamId ? getTeamById(teamId) : null;
                  if (!team) return null;
                  const rank = thirdsRanking.indexOf(teamId!) + 1;
                  return (
                    <div
                      key={team.id}
                      className="w-full flex items-center gap-2.5 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 opacity-50"
                    >
                      <Flag code={team.code} name={team.name} emoji={team.flag} size="sm" rounded />
                      <span className="text-sm font-medium text-zinc-500 flex-1 truncate">
                        <span className="hidden sm:inline">{team.name}</span>
                        <span className="sm:hidden">{team.shortName}</span>
                      </span>
                      <span className="text-xs text-zinc-400 flex-shrink-0">#{rank}</span>
                    </div>
                  );
                })
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
