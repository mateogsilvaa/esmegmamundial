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

// ─── Core entities ───────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  shortName: string;
  flag: string;       // emoji flag (fallback)
  code: string;       // ISO 3166-1 alpha-2 (for flagcdn.com)
  group: string;      // 'A'–'L'
  confederation: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';
  fifaRank?: number;  // for tiebreaking; lower = better
}

export interface Group {
  id: string;         // 'A'–'L'
  name: string;       // 'Grupo A'
  teams: Team[];
  venues?: string[];
}

export interface Match {
  id: string;
  phase: Phase;
  group?: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore: number | null;
  awayScore: number | null;
  homeScoreExtra?: number | null;
  awayScoreExtra?: number | null;
  homePenalties?: number | null;
  awayPenalties?: number | null;
  status: MatchStatus;
  scheduledAt: string;   // ISO datetime
  venue: string;
  matchday?: number;
  roundSlot?: number;
}

export interface Standing {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

// ─── Prediction types ─────────────────────────────────────────────────────────

export interface MatchPrediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
  winnerId?: string;  // knockout only
}

export interface GroupPrediction {
  groupId: string;
  teamOrder: string[]; // 1st→4th team IDs (auto-computed, not manual)
}

export interface BracketPrediction {
  slot: string;       // 'R32_P73'…'FINAL', 'THIRD'
  teamId: string | null;
}

// ─── Bracket slot definition ─────────────────────────────────────────────────

export interface BracketMatch {
  id: string;           // 'P73'…'P104'
  round: Phase;
  slot: number;
  homeSlot: string;     // qualifier slot like 'A1', 'T3', 'P73' (winner of)
  awaySlot: string;
  scheduledAt: string;
  // Which thirds groups qualify for this slot (only for T slots)
  thirdsFrom?: string[];
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export interface ScoreBreakdown {
  exactScore: number;       // exact score in group matches
  correctResult: number;    // correct result (W/D/L) in group matches
  groupPosition: number;    // 1st/2nd place in group correct
  thirdQualifier: number;   // correct 3rd-place team advancing
  knockoutAdvance: number;  // correct team advancing each knockout round
  exactKnockout: number;    // exact score in knockout
  semifinalist: number;     // correct SF team
  finalist: number;         // correct finalist
  champion: number;         // correct champion
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

// ─── User profile ─────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  country: string | null;
  favoriteTeamId: string | null;
  isPublic: boolean;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// First match: Mexico vs Czech Republic, June 11 2026 20:00 UTC
export const PREDICTION_LOCK_DATE = new Date('2026-06-11T20:00:00Z');
export const TOURNAMENT_START = new Date('2026-06-11T20:00:00Z');
export const TOURNAMENT_END = new Date('2026-07-19T21:00:00Z');

export const ACCESS_CODE = 'MUNDIAL67';

export const SCORE_RULES = {
  // Group phase
  EXACT_SCORE_GROUP: 5,       // exact score (includes correct result bonus)
  CORRECT_RESULT_GROUP: 2,    // correct W/D/L only
  GROUP_POS_1ST: 5,           // predict 1st place correctly
  GROUP_POS_2ND: 3,           // predict 2nd place correctly
  THIRD_QUALIFIER: 2,         // predict a 3rd-place team that advances
  // Knockout
  KNOCKOUT_ADVANCE: 5,        // correct team advancing per round
  EXACT_SCORE_KNOCKOUT: 8,    // exact score in a knockout match
  SEMIFINALIST: 5,            // correct semifinalist
  FINALIST: 10,               // correct finalist
  CHAMPION: 25,               // champion
} as const;
