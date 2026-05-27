'use client';

import { useCallback } from 'react';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { R32_MATCHES, R16_MATCHES, QF_MATCHES, SF_MATCHES, FINAL_MATCHES } from '@/lib/data/bracket';
import { getTeamById } from '@/lib/data/teams';
import { resolveThirdSlot } from '@/lib/utils';
import { Flag } from '@/components/ui/Flag';
import { cn } from '@/lib/utils';
import type { BracketMatch } from '@/lib/types';

interface Props {
  qualifiedSlots: Record<string, string | null>;
  thirdGroups: Record<string, string>;
  bracketPreds: Record<string, string | null>;
  onPick: (slot: string, teamId: string | null) => void;
  locked: boolean;
  onResetBracket?: () => void;
}

/**
 * Resolve the team for a bracket homeSlot or awaySlot.
 * slot formats:
 *   'A1', 'B2'      → group winner/runner-up from qualifiedSlots
 *   'T1'–'T8'       → best third (direct key)
 *   'T_ABCDF'       → third from one of those groups (resolved dynamically)
 *   'P73', 'P74'    → winner picked for that knockout match (in bracketPreds)
 *   'L_P101'        → loser of that match (not used in user predictions)
 */
function resolveTeamId(
  slot: string,
  qualifiedSlots: Record<string, string | null>,
  thirdGroups: Record<string, string>,
  bracketPreds: Record<string, string | null>,
): string | null {
  if (slot.startsWith('T_')) {
    const allowedGroups = slot.slice(2).split('');
    return resolveThirdSlot(allowedGroups, qualifiedSlots, thirdGroups);
  }
  if (slot.startsWith('L_')) {
    return null; // loser bracket not selectable by users
  }
  if (slot.startsWith('P')) {
    return bracketPreds[slot] ?? null;
  }
  return qualifiedSlots[slot] ?? null;
}

function getPlaceholderLabel(slot: string): string {
  if (slot.startsWith('T_')) {
    return `3º ${slot.slice(2).split('').join('/')}`;
  }
  if (slot.startsWith('P')) return `G. ${slot}`;
  if (slot.length === 2 && slot[1] === '1') return `1º Grupo ${slot[0]}`;
  if (slot.length === 2 && slot[1] === '2') return `2º Grupo ${slot[0]}`;
  return slot;
}

function MatchSlot({
  match,
  qualifiedSlots,
  thirdGroups,
  bracketPreds,
  onPick,
  locked,
}: {
  match: BracketMatch;
  qualifiedSlots: Record<string, string | null>;
  thirdGroups: Record<string, string>;
  bracketPreds: Record<string, string | null>;
  onPick: (slot: string, teamId: string | null) => void;
  locked: boolean;
}) {
  const homeId  = resolveTeamId(match.homeSlot, qualifiedSlots, thirdGroups, bracketPreds);
  const awayId  = resolveTeamId(match.awaySlot, qualifiedSlots, thirdGroups, bracketPreds);
  const homeTeam = homeId ? getTeamById(homeId) : null;
  const awayTeam = awayId ? getTeamById(awayId) : null;
  const pickedId = bracketPreds[match.id] ?? null;

  const handlePick = (teamId: string | null) => {
    if (locked || !teamId) return;
    onPick(match.id, teamId === pickedId ? null : teamId);
  };

  return (
    <div className="card overflow-hidden text-sm">
      <div className="px-3 py-1 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400">{match.id}</span>
        {pickedId && (
          <span className="text-xs text-green-600 font-medium">Seleccionado</span>
        )}
      </div>

      {/* Home side */}
      <button
        onClick={() => handlePick(homeId)}
        disabled={locked || !homeId}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 transition-colors text-left',
          pickedId === homeId && homeId ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50',
          (!homeId || locked) && 'cursor-default opacity-60',
        )}
      >
        {homeTeam ? (
          <>
            <Flag code={homeTeam.code} name={homeTeam.name} emoji={homeTeam.flag} size="sm" rounded />
            <span className={cn('font-medium truncate flex-1 text-sm', pickedId === homeId ? 'text-white' : 'text-zinc-900')}>
              <span className="hidden md:inline">{homeTeam.name}</span>
              <span className="md:hidden">{homeTeam.shortName}</span>
            </span>
            {pickedId === homeId && <span className="text-xs text-zinc-300 flex-shrink-0">✓</span>}
          </>
        ) : (
          <span className="text-zinc-400 text-xs italic">{getPlaceholderLabel(match.homeSlot)}</span>
        )}
      </button>

      <div className="flex items-center px-3">
        <div className="flex-1 border-t border-zinc-100" />
        <span className="px-2 text-xs text-zinc-300 font-light">vs</span>
        <div className="flex-1 border-t border-zinc-100" />
      </div>

      {/* Away side */}
      <button
        onClick={() => handlePick(awayId)}
        disabled={locked || !awayId}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 transition-colors text-left',
          pickedId === awayId && awayId ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50',
          (!awayId || locked) && 'cursor-default opacity-60',
        )}
      >
        {awayTeam ? (
          <>
            <Flag code={awayTeam.code} name={awayTeam.name} emoji={awayTeam.flag} size="sm" rounded />
            <span className={cn('font-medium truncate flex-1 text-sm', pickedId === awayId ? 'text-white' : 'text-zinc-900')}>
              <span className="hidden md:inline">{awayTeam.name}</span>
              <span className="md:hidden">{awayTeam.shortName}</span>
            </span>
            {pickedId === awayId && <span className="text-xs text-zinc-300 flex-shrink-0">✓</span>}
          </>
        ) : (
          <span className="text-zinc-400 text-xs italic">{getPlaceholderLabel(match.awaySlot)}</span>
        )}
      </button>
    </div>
  );
}

function RoundSection({
  label,
  matches,
  cols = 4,
  qualifiedSlots,
  thirdGroups,
  bracketPreds,
  onPick,
  locked,
}: {
  label: string;
  matches: BracketMatch[];
  cols?: number;
  qualifiedSlots: Record<string, string | null>;
  thirdGroups: Record<string, string>;
  bracketPreds: Record<string, string | null>;
  onPick: (slot: string, teamId: string | null) => void;
  locked: boolean;
}) {
  return (
    <div className="mb-8">
      <p className="section-title">{label}</p>
      <div className={cn(
        'grid gap-3',
        cols === 1 ? 'grid-cols-1 max-w-xs' :
        cols === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' :
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      )}>
        {matches.map(m => (
          <MatchSlot
            key={m.id}
            match={m}
            qualifiedSlots={qualifiedSlots}
            thirdGroups={thirdGroups}
            bracketPreds={bracketPreds}
            onPick={onPick}
            locked={locked}
          />
        ))}
      </div>
    </div>
  );
}

export function BracketTab({ qualifiedSlots, thirdGroups, bracketPreds, onPick, locked, onResetBracket }: Props) {
  // Integrity check: same team can't win two different matches
  const duplicateTeams = useCallback(() => {
    const allMatches = [...R32_MATCHES, ...R16_MATCHES, ...QF_MATCHES, ...SF_MATCHES, ...FINAL_MATCHES];
    const picked = allMatches.map(m => bracketPreds[m.id]).filter(Boolean) as string[];
    return picked.filter((id, i) => picked.indexOf(id) !== i);
  }, [bracketPreds])();

  const groupsComplete = ['A','B','C','D','E','F','G','H','I','J','K','L']
    .every(g => qualifiedSlots[`${g}1`] && qualifiedSlots[`${g}2`]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-zinc-900">Fase eliminatoria</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Selecciona el ganador de cada partido</p>
        </div>
        {onResetBracket && (
          <button onClick={onResetBracket} className="btn-ghost text-red-600 text-xs gap-1">
            <RotateCcw size={12} />
            Reiniciar
          </button>
        )}
      </div>

      {/* Warnings */}
      {!groupsComplete && (
        <div className="card px-4 py-3 mb-6 border-amber-200 bg-amber-50 flex items-start gap-2">
          <AlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Completa el orden de todos los grupos y selecciona los 8 mejores terceros para poder rellenar el bracket.
          </p>
        </div>
      )}

      {duplicateTeams.length > 0 && (
        <div className="card px-4 py-3 mb-6 border-red-200 bg-red-50 flex items-start gap-2">
          <AlertCircle size={15} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">
            Hay equipos duplicados en el bracket. Un equipo no puede ganar dos partidos simultáneos.
          </p>
        </div>
      )}

      <RoundSection label="Dieciseisavos de final" matches={R32_MATCHES} cols={4} qualifiedSlots={qualifiedSlots} thirdGroups={thirdGroups} bracketPreds={bracketPreds} onPick={onPick} locked={locked} />
      <RoundSection label="Octavos de final" matches={R16_MATCHES} cols={4} qualifiedSlots={qualifiedSlots} thirdGroups={thirdGroups} bracketPreds={bracketPreds} onPick={onPick} locked={locked} />
      <RoundSection label="Cuartos de final" matches={QF_MATCHES} cols={2} qualifiedSlots={qualifiedSlots} thirdGroups={thirdGroups} bracketPreds={bracketPreds} onPick={onPick} locked={locked} />
      <RoundSection label="Semifinales" matches={SF_MATCHES} cols={2} qualifiedSlots={qualifiedSlots} thirdGroups={thirdGroups} bracketPreds={bracketPreds} onPick={onPick} locked={locked} />
      <RoundSection label="Final · Tercer puesto" matches={FINAL_MATCHES} cols={2} qualifiedSlots={qualifiedSlots} thirdGroups={thirdGroups} bracketPreds={bracketPreds} onPick={onPick} locked={locked} />
    </div>
  );
}
