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

// ─── Prediction types (NUEVA ARQUITECTURA) ───────────────────────────────────

/**
 * Predicción principal: el usuario elige el orden final de cada grupo.
 * ranking[0] = 1º, ranking[1] = 2º, ranking[2] = 3º, ranking[3] = 4º
 */
export interface GroupOrderPrediction {
  groupId: string;        // 'A'–'L'
  ranking: (string | null)[]; // 4 team IDs, nulls si aún no elegidos
}

/**
 * Los 8 mejores terceros, ordenados por el usuario.
 * ranking[0] = mejor tercero, ranking[7] = 8º mejor
 * Solo puede contener teamIds que sean el 3er clasificado predicho de su grupo.
 */
export interface ThirdsRankingPrediction {
  ranking: string[];  // exactamente 8 team IDs en orden
}

/**
 * Predicción de ganador de cruce en eliminatorias.
 * slot = 'P73'…'P104'
 */
export interface BracketPrediction {
  slot: string;
  teamId: string | null;
}

/**
 * Predicción de score por partido (BONUS — separada de la predicción principal).
 * Se bloquea individualmente al inicio de CADA partido.
 * Vale 2 puntos si el score exacto es correcto.
 */
export interface MatchBonusPrediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
  pointsEarned?: number;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface ScoreBreakdown {
  groupQualifier: number;   // equipos correctos en top 2 de grupo
  groupPosition: number;    // posición exacta correcta (1º vs 2º)
  thirdsSelection: number;  // terceros correctamente seleccionados entre top 8
  thirdsOrder: number;      // bonus por orden exacto de terceros
  knockoutPts: number;      // picks de eliminatoria correctos
  bonusScore: number;       // puntos de predicciones de score exacto
  total: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  country: string | null;
  favoriteTeam: string | null;
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

// CORREGIDO: México vs Sudáfrica, el primer partido oficial
// 11 junio 2026, 19:00 UTC (15:00 Ciudad de México, 21:00 CET)
export const PREDICTION_LOCK_DATE = new Date('2026-06-11T19:00:00Z');

export const TOURNAMENT_START = new Date('2026-06-11T19:00:00Z');
export const TOURNAMENT_END   = new Date('2026-07-19T19:00:00Z');

export const ACCESS_CODE = 'MUNDIAL67';

// Sistema de puntuación oficial
export const SCORE_RULES = {
  // Fase de grupos (predicción principal)
  GROUP_QUALIFIER:   3,   // equipo correctamente en top 2 (cualquier posición)
  GROUP_POS_EXACT:   2,   // bonus si además la posición exacta (1º o 2º) es correcta
  THIRDS_SELECTED:   3,   // tercero correcto seleccionado entre los 8 mejores
  THIRDS_ORDER:      1,   // bonus por orden exacto del tercero

  // Eliminatorias (picks de bracket)
  KNOCKOUT_R32:      3,   // cruce de 32 correcto
  KNOCKOUT_R16:      4,   // octavos correcto
  KNOCKOUT_QF:       5,   // cuartos correcto
  KNOCKOUT_SF:       7,   // semifinal correcto
  KNOCKOUT_FINAL:    8,   // final correcto
  CHAMPION:         10,   // campeón correcto

  // Bonus de score (predicción separada por partido)
  BONUS_EXACT_SCORE: 2,   // score exacto de cualquier partido
} as const;
