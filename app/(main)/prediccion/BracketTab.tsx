'use client';

import { RotateCcw, Lock, Clock, ChevronRight, Trophy } from 'lucide-react';
import { getTeamById } from '@/lib/data/teams';
import { Flag } from '@/components/ui/Flag';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { OfficialKnockoutMatch, Phase } from '@/lib/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  bracketStatus:  'not_open' | 'open' | 'locked';
  openAt:         string | null;   // ISO – cuándo abre
  lockAt:         string | null;   // ISO – cuándo cierra
  matches:        OfficialKnockoutMatch[];
  bracketPreds:   Record<string, string | null>;
  onPick:         (matchId: string, teamId: string | null) => void;
  onResetBracket?: () => void;
}

// ─── Metadatos de ronda ───────────────────────────────────────────────────────

const ROUND_META: Record<Phase, { label: string; accent: string; pill: string }> = {
  round_of_32:  { label: 'Dieciseisavos', accent: 'bg-zinc-300',    pill: 'bg-zinc-100 text-zinc-600'       },
  round_of_16:  { label: 'Octavos',       accent: 'bg-blue-400',    pill: 'bg-blue-50 text-blue-700'        },
  quarterfinal: { label: 'Cuartos',       accent: 'bg-violet-400',  pill: 'bg-violet-50 text-violet-700'    },
  semifinal:    { label: 'Semifinales',   accent: 'bg-amber-400',   pill: 'bg-amber-50 text-amber-700'      },
  third_place:  { label: 'Tercer puesto', accent: 'bg-zinc-400',    pill: 'bg-zinc-100 text-zinc-600'       },
  final:        { label: 'Final',         accent: 'bg-zinc-900',    pill: 'bg-zinc-900 text-white'          },
  group:        { label: 'Grupo',         accent: 'bg-zinc-300',    pill: 'bg-zinc-100 text-zinc-600'       },
};

// ─── Match card ───────────────────────────────────────────────────────────────

interface MatchCardProps {
  match:        OfficialKnockoutMatch;
  pickedId:     string | null;
  onPick:       (teamId: string | null) => void;
  locked:       boolean;
}

function MatchCard({ match, pickedId, onPick, locked }: MatchCardProps) {
  const homeTeam = match.homeTeamId ? getTeamById(match.homeTeamId) : null;
  const awayTeam = match.awayTeamId ? getTeamById(match.awayTeamId) : null;
  const bothKnown = Boolean(match.homeTeamId && match.awayTeamId);

  const handleClick = (teamId: string | null) => {
    if (locked || !teamId || !bothKnown) return;
    // Toggle: click again to unselect
    onPick(teamId === pickedId ? null : teamId);
  };

  return (
    <div className={cn(
      'rounded-xl border border-zinc-200 overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-md',
      !bothKnown && 'opacity-50',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-50 border-b border-zinc-100">
        <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">{match.id}</span>
        {match.winnerId && (
          <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">Oficial</span>
        )}
        {pickedId && bothKnown && !match.winnerId && (
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">✓ Pick</span>
        )}
      </div>

      {/* Home team */}
      <TeamRow
        team={homeTeam}
        teamId={match.homeTeamId}
        picked={pickedId === match.homeTeamId && Boolean(match.homeTeamId)}
        isOfficialWinner={match.winnerId === match.homeTeamId}
        onClick={() => handleClick(match.homeTeamId)}
        disabled={locked || !bothKnown}
      />

      {/* Divider */}
      <div className="flex items-center px-3">
        <div className="flex-1 border-t border-zinc-100" />
        <span className="px-2 text-[10px] font-medium text-zinc-300">vs</span>
        <div className="flex-1 border-t border-zinc-100" />
      </div>

      {/* Away team */}
      <TeamRow
        team={awayTeam}
        teamId={match.awayTeamId}
        picked={pickedId === match.awayTeamId && Boolean(match.awayTeamId)}
        isOfficialWinner={match.winnerId === match.awayTeamId}
        onClick={() => handleClick(match.awayTeamId)}
        disabled={locked || !bothKnown}
      />
    </div>
  );
}

interface TeamRowProps {
  team:             ReturnType<typeof getTeamById>;
  teamId:           string | null;
  picked:           boolean;
  isOfficialWinner: boolean;
  onClick:          () => void;
  disabled:         boolean;
}

function TeamRow({ team, teamId, picked, isOfficialWinner, onClick, disabled }: TeamRowProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || !teamId}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all',
        picked
          ? 'bg-zinc-900 text-white'
          : isOfficialWinner
            ? 'bg-green-50'
            : 'hover:bg-zinc-50 active:bg-zinc-100',
        (disabled || !teamId) && !picked && 'cursor-default',
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
            picked ? 'text-white' : isOfficialWinner ? 'text-green-800' : 'text-zinc-900',
          )}>
            <span className="hidden md:inline">{team.name}</span>
            <span className="md:hidden">{team.shortName}</span>
          </span>
          {isOfficialWinner && !picked && (
            <Trophy size={12} className="text-green-600 flex-shrink-0" />
          )}
          {picked && (
            <svg className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </>
      ) : (
        <span className="text-xs text-zinc-400 italic">Por determinar</span>
      )}
    </button>
  );
}

// ─── Round section ────────────────────────────────────────────────────────────

interface RoundSectionProps {
  matches:      OfficialKnockoutMatch[];
  bracketPreds: Record<string, string | null>;
  onPick:       (matchId: string, teamId: string | null) => void;
  locked:       boolean;
}

function RoundSection({ matches, bracketPreds, onPick, locked }: RoundSectionProps) {
  if (matches.length === 0) return null;

  const round  = matches[0].round;
  const meta   = ROUND_META[round] ?? ROUND_META.round_of_32;
  const picked = matches.filter(m => bracketPreds[m.id]).length;
  const total  = matches.length;

  const cols =
    total >= 8 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
    total >= 4 ? 'grid-cols-1 sm:grid-cols-2' :
    total >= 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-xl' :
                 'grid-cols-1 max-w-xs';

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('h-5 w-1 rounded-full flex-shrink-0', meta.accent)} />
        <h3 className="font-display font-bold text-lg text-zinc-900">{meta.label}</h3>
        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', meta.pill)}>
          {picked}/{total}
        </span>
      </div>

      <div className={cn('grid gap-3', cols)}>
        {matches.map(m => (
          <MatchCard
            key={m.id}
            match={m}
            pickedId={bracketPreds[m.id] ?? null}
            onPick={(teamId) => onPick(m.id, teamId)}
            locked={locked}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Champion strip ───────────────────────────────────────────────────────────

function ChampionStrip({
  bracketPreds,
  matches,
}: {
  bracketPreds: Record<string, string | null>;
  matches:      OfficialKnockoutMatch[];
}) {
  const finalMatch = matches.find(m => m.round === 'final');
  if (!finalMatch) return null;

  const championId = bracketPreds[finalMatch.id];
  if (!championId) return null;

  const team = getTeamById(championId);
  if (!team) return null;

  // Build the path of matches where this team was picked
  const allMatchesByOrder = [...matches]; // already ordered P73→P104
  const path: string[] = [];
  for (const m of allMatchesByOrder) {
    if (bracketPreds[m.id] === championId) {
      path.push(m.id);
    }
  }

  if (path.length < 2) return null;

  return (
    <div className="mb-8 rounded-xl bg-zinc-900 text-white px-4 py-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Flag code={team.code} name={team.name} emoji={team.flag} size="sm" rounded />
          <span className="font-bold text-sm">{team.name}</span>
        </div>
        <span className="text-zinc-500 text-xs">campeón predicho</span>
        <div className="flex items-center gap-1 flex-wrap">
          {path.map((matchId, idx) => (
            <span key={matchId} className="flex items-center gap-1">
              {idx > 0 && <ChevronRight size={12} className="text-zinc-600" />}
              <span className="text-xs text-zinc-400 font-medium">{matchId}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Estado: No disponible aún ────────────────────────────────────────────────

function NotOpenState({ openAt }: { openAt: string | null }) {
  const openDate = openAt
    ? format(new Date(openAt), "d 'de' MMMM 'a las' HH:mm", { locale: es })
    : null;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-5">
        <Clock size={28} className="text-zinc-400" />
      </div>
      <h3 className="font-display text-xl font-bold text-zinc-900 mb-2">
        Bracket no disponible aún
      </h3>
      <p className="text-sm text-zinc-500 max-w-sm">
        Las predicciones de bracket se abrirán cuando se confirme el cuadro oficial
        de la fase eliminatoria.
      </p>
      {openDate && (
        <div className="mt-4 px-4 py-2 rounded-lg bg-zinc-100 text-sm font-medium text-zinc-700">
          Apertura prevista: {openDate}
        </div>
      )}
    </div>
  );
}

// ─── Estado: Bloqueado ────────────────────────────────────────────────────────

function LockedBanner({ lockAt }: { lockAt: string | null }) {
  const lockDate = lockAt
    ? format(new Date(lockAt), "d 'de' MMMM 'a las' HH:mm", { locale: es })
    : null;

  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-600 text-sm font-medium mb-6">
      <Lock size={14} className="flex-shrink-0" />
      <span>Predicciones de bracket cerradas{lockDate ? ` desde el ${lockDate}` : ''}</span>
    </div>
  );
}

// ─── Main BracketTab ──────────────────────────────────────────────────────────

export function BracketTab({
  bracketStatus, openAt, lockAt, matches, bracketPreds, onPick, onResetBracket,
}: Props) {
  const locked = bracketStatus === 'locked';

  if (bracketStatus === 'not_open') {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-bold text-zinc-900">Fase eliminatoria</h2>
        </div>
        <NotOpenState openAt={openAt} />
      </div>
    );
  }

  // Group matches by round in display order
  const roundOrder: Phase[] = ['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final'];
  const byRound = roundOrder.reduce<Record<string, OfficialKnockoutMatch[]>>((acc, r) => {
    acc[r] = matches.filter(m => m.round === r);
    return acc;
  }, {});

  const totalPicks   = Object.values(bracketPreds).filter(Boolean).length;
  const totalMatches = matches.filter(m => m.round !== 'third_place').length; // excluir 3er puesto

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-zinc-900">Fase eliminatoria</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {totalPicks}/{totalMatches} picks · 5 pts por ganador acertado
          </p>
        </div>
        {!locked && onResetBracket && (
          <button onClick={onResetBracket} className="btn-ghost text-red-600 text-xs gap-1 flex-shrink-0">
            <RotateCcw size={12} />
            Reiniciar
          </button>
        )}
      </div>

      {locked && <LockedBanner lockAt={lockAt} />}

      {/* Champion path strip */}
      <ChampionStrip bracketPreds={bracketPreds} matches={matches} />

      {/* Rounds */}
      {roundOrder.map(round => (
        <RoundSection
          key={round}
          matches={byRound[round] ?? []}
          bracketPreds={bracketPreds}
          onPick={onPick}
          locked={locked}
        />
      ))}
    </div>
  );
}
