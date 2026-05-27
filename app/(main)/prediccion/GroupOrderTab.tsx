'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, RotateCcw, CheckCircle } from 'lucide-react';
import { GROUP_IDS, getTeamsByGroup } from '@/lib/data/teams';
import { Flag } from '@/components/ui/Flag';
import { cn } from '@/lib/utils';
import {
  isGroupComplete,
  completedGroupsCount,
  type GroupOrders,
} from '@/lib/groupPrediction';
import type { Team } from '@/lib/types';

interface Props {
  groupOrders: GroupOrders;
  onChange: (groupId: string, ranking: (string | null)[]) => void;
  locked: boolean;
  onReset?: () => void;
}

const RANK_LABELS = ['1º', '2º', '3º', '4º'];
const RANK_COLORS = [
  'border-green-500 bg-green-50',
  'border-green-500 bg-green-50',
  '',
  '',
];

interface GroupCardProps {
  groupId: string;
  teams: Team[];
  ranking: (string | null)[];
  onChange: (ranking: (string | null)[]) => void;
  locked: boolean;
  defaultOpen: boolean;
}

function GroupCard({ groupId, teams, ranking, onChange, locked, defaultOpen }: GroupCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const complete = isGroupComplete(ranking);

  const assignedIds = ranking.filter(Boolean) as string[];
  const unassigned  = teams.filter(t => !assignedIds.includes(t.id));

  const handleAdd = (teamId: string) => {
    if (locked) return;
    const first = ranking.findIndex(r => !r);
    if (first === -1) return;
    const next = [...ranking];
    next[first] = teamId;
    onChange(next);
  };

  const handleRemove = (pos: number) => {
    if (locked) return;
    const next = [...ranking];
    next[pos] = null;
    onChange(next);
  };

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-lg text-zinc-900">Grupo {groupId}</span>
          {complete ? (
            <CheckCircle size={15} className="text-green-500" />
          ) : (
            <span className="text-xs text-zinc-400">{assignedIds.length}/4</span>
          )}
          {/* Mini preview of top-2 */}
          {!open && ranking[0] && (
            <div className="flex items-center gap-1">
              {ranking.slice(0, 2).map((tid, i) => {
                const t = teams.find(x => x.id === tid);
                return t ? (
                  <Flag key={i} code={t.code} name={t.name} emoji={t.flag} size="xs" rounded />
                ) : null;
              })}
            </div>
          )}
        </div>
        {open
          ? <ChevronUp size={16} className="text-zinc-400" />
          : <ChevronDown size={16} className="text-zinc-400" />
        }
      </button>

      {open && (
        <div className="border-t border-zinc-100 px-4 pt-3 pb-4 space-y-3">
          {/* Position slots */}
          <div className="space-y-1.5">
            {[0, 1, 2, 3].map(pos => {
              const teamId = ranking[pos];
              const team   = teamId ? teams.find(t => t.id === teamId) : null;
              return (
                <div
                  key={pos}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors',
                    team
                      ? cn('border-zinc-200 bg-white', pos < 2 && 'border-green-300 bg-green-50/40')
                      : 'border-dashed border-zinc-200 bg-zinc-50',
                  )}
                >
                  <span className={cn(
                    'text-xs font-bold w-5 text-center flex-shrink-0',
                    pos < 2 ? 'text-green-600' : 'text-zinc-400',
                  )}>
                    {RANK_LABELS[pos]}
                  </span>

                  {team ? (
                    <>
                      <Flag code={team.code} name={team.name} emoji={team.flag} size="sm" rounded />
                      <span className="text-sm font-medium text-zinc-900 flex-1 truncate">
                        <span className="hidden sm:inline">{team.name}</span>
                        <span className="sm:hidden">{team.shortName}</span>
                      </span>
                      {!locked && (
                        <button
                          onClick={() => handleRemove(pos)}
                          className="text-zinc-300 hover:text-red-500 transition-colors flex-shrink-0"
                          aria-label="Quitar"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-zinc-400 italic">Elige un equipo abajo</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Unassigned team pool */}
          {unassigned.length > 0 && !locked && (
            <div>
              <p className="text-xs text-zinc-400 mb-1.5">Equipos disponibles — toca para asignar:</p>
              <div className="flex flex-wrap gap-2">
                {unassigned.map(team => (
                  <button
                    key={team.id}
                    onClick={() => handleAdd(team.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 active:bg-zinc-100 transition-colors"
                  >
                    <Flag code={team.code} name={team.name} emoji={team.flag} size="xs" rounded />
                    <span className="hidden sm:inline">{team.name}</span>
                    <span className="sm:hidden">{team.shortName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {locked && (
            <p className="text-xs text-zinc-400 italic">Predicciones bloqueadas</p>
          )}
        </div>
      )}
    </div>
  );
}

export function GroupOrderTab({ groupOrders, onChange, locked, onReset }: Props) {
  const teams = Object.fromEntries(GROUP_IDS.map(gId => [gId, getTeamsByGroup(gId)]));
  const completed = completedGroupsCount(groupOrders);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-zinc-900">Fase de grupos</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Elige el orden final de cada grupo (1º–4º)
          </p>
        </div>
        {onReset && !locked && (
          <button onClick={onReset} className="btn-ghost text-red-600 text-xs gap-1">
            <RotateCcw size={12} />
            Reiniciar
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="card px-4 py-2.5 mb-5 flex items-center gap-3 bg-zinc-50">
        <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-800 rounded-full transition-all duration-300"
            style={{ width: `${(completed / 12) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-zinc-600 flex-shrink-0">{completed}/12 grupos</span>
      </div>

      {/* Group cards */}
      <div className="space-y-3">
        {GROUP_IDS.map((gId, idx) => (
          <GroupCard
            key={gId}
            groupId={gId}
            teams={teams[gId]}
            ranking={groupOrders[gId] ?? [null, null, null, null]}
            onChange={ranking => onChange(gId, ranking)}
            locked={locked}
            defaultOpen={idx < 4}
          />
        ))}
      </div>
    </div>
  );
}
