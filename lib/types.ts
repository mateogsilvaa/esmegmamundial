// ─── Enums ───────────────────────────────────────────────────────────────────

export type Phase =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarterfinal'
  | 'semifinal'
  | 'third_place'
  | 'final';

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed';

// ─── Core entities ────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  shortName: string;
  flag: string;       // emoji flag (fallback)
  code: string;       // ISO 3166-1 alpha-2 (for flagcdn.com)
  group: string;      // 'A'–'L'
  confederation: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';
  fifaRank?: number;
}

export interface Match {
  id: string;
  phase: Phase;
  group?: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  scheduledAt: string;   // ISO UTC
  venue: string;
  matchday?: number;
}

export interface BracketMatch {
  id: string;           // 'P73'…'P104'
  round: Phase;
  slot: number;
  homeSlot: string;
  awaySlot: string;
  scheduledAt: string;
  thirdsFrom?: string[];
}

// ─── Official knockout match (from DB) ───────────────────────────────────────
//
// Used by the bracket tab when the official bracket is published.
// Teams come from the real matches table, not derived from user predictions.

export interface OfficialKnockoutMatch {
  id: string;                // 'P73'…'P104'
  round: Phase;
  homeTeamId: string | null;
  awayTeamId: string | null;
  winnerId:   string | null; // official winner (null until match is played)
  scheduledAt: string;
}

// ─── Prediction types ────────────────────────────────────────────────────────

/**
 * El usuario elige el orden final de cada grupo (1º–4º).
 * ranking[0] = 1º, ranking[3] = 4º
 */
export interface GroupOrderPrediction {
  groupId: string;
  ranking: (string | null)[];
}

/**
 * Pick de ganador de un cruce eliminatorio.
 * slot = match ID ('P73'…'P104')
 */
export interface BracketPrediction {
  slot: string;
  teamId: string | null;
}

/**
 * Predicción de score de un partido (bonus, separada de la predicción principal).
 * Se bloquea al inicio de CADA partido.
 */
export interface MatchBonusPrediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
  pointsEarned?: number;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface ScoreBreakdown {
  groupPts:   number;   // puntos totales de fase de grupos
  bracketPts: number;   // puntos totales de eliminatorias
  bonusPts:   number;   // puntos bonus de scores exactos
  total:      number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  country: string | null;
  favoriteTeamId: string | null;
  totalPoints: number;
  breakdown: ScoreBreakdown;
  rank: number;
  previousRank?: number;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  country: string | null;
  favoriteTeamId: string | null;
  isPublic: boolean;
  isPredictionsPublic: boolean;
  createdAt: string;
}

// ─── Standing ─────────────────────────────────────────────────────────────────

export interface Standing {
  teamId: string;
  pts: number;
  gf: number;
  ga: number;
  gd: number;
  won: number;
  drawn: number;
  lost: number;
  played: number;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

// Cierre de predicciones de grupo: primer partido del torneo
export const PREDICTION_LOCK_DATE = new Date('2026-06-11T19:00:00Z');

export const TOURNAMENT_START = new Date('2026-06-11T19:00:00Z');
export const TOURNAMENT_END   = new Date('2026-07-19T19:00:00Z');

export const ACCESS_CODE = 'MUNDIAL67';

// ─── Sistema de puntuación ────────────────────────────────────────────────────
//
// FASE DE GRUPOS
//   2 pts por posición correcta (1º–4º).
//   Si las 4 posiciones son correctas → 10 pts totales (no 8):
//   el bonus extra de 2 se aplica solo cuando el grupo es perfecto.
//
// BRACKET ELIMINATORIO
//   5 pts planos por acertar el ganador de cualquier cruce.
//
// BONUS POR PARTIDO (score prediction)
//   1 pt si el resultado (victoria/empate) es correcto.
//   3 pts en total si el score exacto es correcto.
//   NO acumulativo: score exacto da 3 (no 1+3=4).
//
export const SCORE_RULES = {
  GROUP_POSITION:     2,  // pts por posición correcta dentro del grupo
  GROUP_PERFECT_BONUS: 2, // pts extra cuando las 4 posiciones son correctas (→ 10 total)

  BRACKET_WINNER:     5,  // pts por acertar el ganador de un cruce

  BONUS_RESULT:       1,  // pts si el resultado (V/E/D) es correcto
  BONUS_EXACT:        3,  // pts totales si el score exacto es correcto (no acumulativo)
} as const;
