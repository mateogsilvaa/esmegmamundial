'use client';

import { useMemo } from 'react';
import { RotateCcw, AlertCircle, ChevronRight } from 'lucide-react';
import {
  R32_MATCHES, R16_MATCHES, QF_MATCHES, SF_MATCHES, FINAL_MATCHES,
} from '@/lib/data/bracket';
import { getTeamById } from '@/lib/data/teams';
import { resolveAllThirdSlots } from '@/lib/utils';
import { Flag } from '@/components/ui/Flag';
import { cn } from '@/lib/utils';
import type { BracketMatch } from '@/lib/types';

// ─── Prop types ───────────────────────────────────────────────────────────────

interface Props {
  qualifiedSlots: Record<string, string | null>;
  thirdGroups:    Record<string, string>;
  bracketPreds:   Record<string, string | null>;
  onPick:         (slot: string, teamId: string | null) => void;
  locked:         boolean;
  onResetBracket?: () => void;
}

// ─── Single-source slot resolution ────────────────────────────────────────────
//
// resolvedThirds is computed ONCE per render and shared by all match cards.
// This is the fix for the "same team in two matches" bug.

function useResolvedTeams(
  qualifiedSlots: Record<string, string | null>,
  thirdGroups:    Record<string, string>,
  bracketPreds:   Record<string, string | null>,
) {
  return useMemo(() => {
    const resolvedThirds = resolveAllThirdSlots(qualifiedSlots, thirdGroups);

    function resolveSlot(slot: string): string | null {
      if (slot.startsWith('T_'))  return resolvedThirds[slot] ?? null;
      if (slot.startsWith('P'))   return bracketPreds[slot]   ?? null;
      if (slot.startsWith('L_'))  return null;
      return qualifiedSlots[slot] ?? null;
    }

    return { resolveSlot, resolvedThirds };
  }, [qualifiedSlots, thirdGroups, bracketPreds]);
}

// ─── Placeholder label for unresolved slots ───────────────────────────────────

function slotLabel(slot: string): string {
  if (slot.startsWith('T_')) return `3º ${slot.slice(2).split('').join('/')}`;
  if (slot.startsWith('P'))  return `Gan. ${slot}`;
  if (slot.length === 2) {
    const pos = slot[1] === '1' ? '1º' : '2º';
    return `${pos} Gr. ${slot[0]}`;
  }
  return slot;
}

// ─── Round metadata ───────────────────────────────────────────────────────────

const ROUND_META: Record<string, { label: string; short: string; accent: string; pill: string }> = {
  round_of_32: {
    label: 'Dieciseisavos de final',
    short: 'R32',
    accent: 'border-l-zinc-300',
    pill:   'bg-zinc-100 text-zinc-600',
  },
  round_of_16: {
    label: 'Octavos de final',
    short: 'R16',
    accent: 'border-l-blue-400',
    pill:   'bg-blue-50 text-blue-700',
  },
  quarterfinal: {
    label: 'Cuartos de final',
    short: 'QF',
    accent: 'border-l-violet-400',
    pill:   'bg-violet-50 text-violet-700',
  },
  semifinal: {
    label: 'Semifinales',
    short: 'SF',
    accent: 'border-l-amber-400',
    pill:   'bg-amber-50 text-amber-700',
  },
  third_place: {
    label: 'Tercer puesto',
    short: '3P',
    accent: 'border-l-zinc-400',
    pill:   'bg-zinc-100 text-zinc-600',
  },
  final: {
    label: 'Final',
    short: 'F',
    accent: 'border-l-zinc-900',
    pill:   'bg-zinc-900 text-white',
  },
};

// ─── Match card ───────────────────────────────────────────────────────────────

interface MatchCardProps {
  match:      BracketMatch;
  resolveSlot: (slot: string) => string | null;
  bracketPreds: Record<string, string | null>;
  onPick:     (slot: string, teamId: string | null) => void;
  locked:     boolean;
}

function MatchCard({ match, resolveSlot, bracketPreds, onPick, locked }: MatchCardProps) {
  const homeId   = resolveSlot(match.homeSlot);
  const awayId   = resolveSlot(match.awaySlot);
  const homeTeam = homeId ? getTeamById(homeId) : null;
  const awayTeam = awayId ? getTeamById(awayId) : null;
  const pickedId = bracketPreds[match.id] ?? null;
  const meta     = ROUND_META[match.round] ?? ROUND_META.round_of_32;

  const bothKnown = Boolean(homeId && awayId);

  const handlePick = (teamId: string | null) => {
    if (locked || !teamId || !bothKnown) return;
    onPick(match.id, teamId === pickedId ? null : teamId);
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-200 overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-md',
        !bothKnown && 'opacity-60',
      )}
    >
      {/* Match ID header */}
      <div className={cn(
        'flex items-center justify-between px-3 py-1.5 border-b border-zinc-100',
        'bg-zinc-50',
      )}>
        <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">{match.id}</span>
        {pickedId && bothKnown && (
          <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wide">✓ Elegido</span>
        )}
      </div>

      {/* Home team */}
      <TeamRow
        teamId={homeId}
        team={homeTeam}
        placeholder={slotLabel(match.homeSlot)}
        picked={pickedId === homeId && Boolean(homeId)}
        onClick={() => handlePick(homeId)}
        disabled={locked || !homeId || !bothKnown}
      />

      {/* Divider */}
      <div className="flex items-center px-3">
        <div className="flex-1 border-t border-zinc-100" />
        <span className="px-2 text-[10px] font-medium text-zinc-300">vs</span>
        <div className="flex-1 border-t border-zinc-100" />
      </div>

      {/* Away team */}
      <TeamRow
        teamId={awayId}
        team={awayTeam}
        placeholder={slotLabel(match.awaySlot)}
        picked={pickedId === awayId && Boolean(awayId)}
        onClick={() => handlePick(awayId)}
        disabled={locked || !awayId || !bothKnown}
      />
    </div>
  );
}

interface TeamRowProps {
  teamId:      string | null;
  team:        ReturnType<typeof getTeamById>;
  placeholder: string;
  picked:      boolean;
  onClick:     () => void;
  disabled:    boolean;
}

function TeamRow({ team, placeholder, picked, onClick, disabled }: TeamRowProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all',
        picked
          ? 'bg-zinc-900 text-white'
          : 'hover:bg-zinc-50 active:bg-zinc-100',
        disabled && !picked && 'cursor-default',
      )}
    >
      {team ? (
        <>
          <Flag
            code={team.code}
            name={team.name}
            emoji={team.flag}
            size="sm"
            rounded
            className="flex-shrink-0"
          />
          <span className={cn(
            'text-sm font-semibold flex-1 truncate',
            picked ? 'text-white' : 'text-zinc-900',
          )}>
            <span className="hidden md:inline">{team.name}</span>
            <span className="md:hidden">{team.shortName}</span>
          </span>
          {picked && (
            <svg className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </>
      ) : (
        <span className="text-xs text-zinc-400 italic">{placeholder}</span>
      )}
    </button>
  );
}

// ─── Round section ────────────────────────────────────────────────────────────

interface RoundSectionProps {
  matches:      BracketMatch[];
  resolveSlot:  (slot: string) => string | null;
  bracketPreds: Record<string, string | null>;
  onPick:       Props['onPick'];
  locked:       boolean;
}

function RoundSection({ matches, resolveSlot, bracketPreds, onPick, locked }: RoundSectionProps) {
  if (matches.length === 0) return null;
  const round = matches[0].round;
  const meta  = ROUND_META[round] ?? ROUND_META.round_of_32;

  const picked   = matches.filter(m => bracketPreds[m.id]).length;
  const total    = matches.length;

  const cols =
    total >= 8 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
    total >= 4 ? 'grid-cols-1 sm:grid-cols-2' :
    total >= 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-xl' :
                 'grid-cols-1 max-w-xs';

  return (
    <section className="mb-8">
      {/* Round header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('h-5 w-1 rounded-full', meta.accent.replace('border-l-', 'bg-'))} />
        <h3 className="font-display font-bold text-lg text-zinc-900">{meta.label}</h3>
        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', meta.pill)}>
          {picked}/{total}
        </span>
      </div>

      {/* Match grid */}
      <div className={cn('grid gap-3', cols)}>
        {matches.map(m => (
          <MatchCard
            key={m.id}
            match={m}
            resolveSlot={resolveSlot}
            bracketPreds={bracketPreds}
            onPick={onPick}
            locked={locked}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Champion path strip ──────────────────────────────────────────────────────

function ChampionPath({
  bracketPreds,
  resolveSlot,
}: {
  bracketPreds: Record<string, string | null>;
  resolveSlot:  (slot: string) => string | null;
}) {
  // Walk from R32 upwards following the user's picks
  const allMatches = [...R32_MATCHES, ...R16_MATCHES, ...QF_MATCHES, ...SF_MATCHES, ...FINAL_MATCHES];
  const finalMatch = FINAL_MATCHES.find(m => m.round === 'final');
  if (!finalMatch) return null;

  const champion = bracketPreds[finalMatch.id];
  if (!champion) return null;

  const team = getTeamById(champion);
  if (!team) return null;

  // Trace backwards: find which matches this team won
  const path: string[] = [];
  let currentTeamId = champion;

  for (const match of [...allMatches].reverse()) {
    if (bracketPreds[match.id] === currentTeamId) {
      path.unshift(match.id);
    }
  }

  if (path.length < 2) return null;

  return (
    <div className="mb-8 card px-4 py-3 bg-zinc-900 text-white">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Flag code={team.code} name={team.name} emoji={team.flag} size="sm" rounded />
          <span className="font-bold text-sm">{team.name}</span>
        </div>
        <span className="text-zinc-500 text-xs">campeón predicho</span>
        <div className="flex items-center gap-1 flex-wrap">
          {path.map((matchId, idx) => (
            <span key={matchId} className="flex items-center gap-1">
              {idx > 0 && <ChevronRight size={12} className="text-zinc-500" />}
              <span className="text-xs text-zinc-400 font-medium">{matchId}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main BracketTab ──────────────────────────────────────────────────────────

export function BracketTab({
  qualifiedSlots, thirdGroups, bracketPreds, onPick, locked, onResetBracket,
}: Props) {
  const { resolveSlot } = useResolvedTeams(qualifiedSlots, thirdGroups, bracketPreds);

  // Check prerequisites
  const groupsComplete = ['A','B','C','D','E','F','G','H','I','J','K','L']
    .every(g => qualifiedSlots[`${g}1`] && qualifiedSlots[`${g}2`]);

  const thirdsComplete = Object.keys(thirdGroups).length >= 8;

  // Check for integrity issues (same team in multiple picks)
  const allPicks = Object.entries(bracketPreds)
    .filter(([, v]) => Boolean(v))
    .map(([, v]) => v as string);
  const hasDuplicatePicks = allPicks.length !== new Set(allPicks).size;

  const totalPicks   = allPicks.length;
  const totalMatches = [...R32_MATCHES, ...R16_MATCHES, ...QF_MATCHES, ...SF_MATCHES, ...FINAL_MATCHES].length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-zinc-900">Fase eliminatoria</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {totalPicks}/{totalMatches} picks · Elige el ganador de cada cruce
          </p>
        </div>
        {onResetBracket && (
          <button onClick={onResetBracket} className="btn-ghost text-red-600 text-xs gap-1 flex-shrink-0">
            <RotateCcw size={12} />
            Reiniciar
          </button>
        )}
      </div>

      {/* Warnings */}
      {(!groupsComplete || !thirdsComplete) && (
        <div className="card px-4 py-3 mb-5 border-amber-200 bg-amber-50 flex items-start gap-2.5">
          <AlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            {!groupsComplete && <p>Completa el <strong>orden de todos los grupos</strong> primero.</p>}
            {groupsComplete && !thirdsComplete && (
              <p>Selecciona los <strong>8 mejores terceros</strong> para poder rellenar el bracket.</p>
            )}
          </div>
        </div>
      )}

      {hasDuplicatePicks && (
        <div className="card px-4 py-3 mb-5 border-red-200 bg-red-50 flex items-start gap-2.5">
          <AlertCircle size={15} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">
            Hay selecciones inconsistentes. El bracket se limpiará automáticamente al guardar.
          </p>
        </div>
      )}

      {/* Champion path (only if champion picked) */}
      {groupsComplete && thirdsComplete && (
        <ChampionPath bracketPreds={bracketPreds} resolveSlot={resolveSlot} />
      )}

      {/* Rounds */}
      <RoundSection
        matches={R32_MATCHES}
        resolveSlot={resolveSlot}
        bracketPreds={bracketPreds}
        onPick={onPick}
        locked={locked}
      />
      <RoundSection
        matches={R16_MATCHES}
        resolveSlot={resolveSlot}
        bracketPreds={bracketPreds}
        onPick={onPick}
        locked={locked}
      />
      <RoundSection
        matches={QF_MATCHES}
        resolveSlot={resolveSlot}
        bracketPreds={bracketPreds}
        onPick={onPick}
        locked={locked}
      />
      <RoundSection
        matches={SF_MATCHES}
        resolveSlot={resolveSlot}
        bracketPreds={bracketPreds}
        onPick={onPick}
        locked={locked}
      />
      <RoundSection
        matches={FINAL_MATCHES}
        resolveSlot={resolveSlot}
        bracketPreds={bracketPreds}
        onPick={onPick}
        locked={locked}
      />
    </div>
  );
}
