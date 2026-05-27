/**
 * Bracket oficial del Mundial 2026 — 32 partidos de eliminatorias.
 *
 * Fuente: FIFA oficial
 * Horas en UTC. Slots homeSlot/awaySlot según cuadro oficial.
 *
 * Formato de slots:
 *   'A1', 'B2'    → 1º/2º del grupo
 *   'T_ABCDF'     → mejor tercero de esos grupos (resolución dinámica)
 *   'P73'…        → ganador del cruce anterior
 *   'L_P101'      → perdedor (tercer puesto)
 */

import type { BracketMatch } from '@/lib/types';

// ─── Dieciseisavos de final (R32) ─────────────────────────────────────────────

export const R32_MATCHES: BracketMatch[] = [
  { id: 'P73',  round: 'round_of_32', slot: 1,  homeSlot: 'A2',       awaySlot: 'B2',       scheduledAt: '2026-06-28T19:00:00Z', thirdsFrom: [] },
  { id: 'P74',  round: 'round_of_32', slot: 2,  homeSlot: 'E1',       awaySlot: 'T_ABCDF',  scheduledAt: '2026-06-29T20:30:00Z', thirdsFrom: ['A','B','C','D','F'] },
  { id: 'P75',  round: 'round_of_32', slot: 3,  homeSlot: 'F1',       awaySlot: 'C2',       scheduledAt: '2026-06-30T01:00:00Z', thirdsFrom: [] },
  { id: 'P76',  round: 'round_of_32', slot: 4,  homeSlot: 'C1',       awaySlot: 'F2',       scheduledAt: '2026-06-29T17:00:00Z', thirdsFrom: [] },
  { id: 'P77',  round: 'round_of_32', slot: 5,  homeSlot: 'I1',       awaySlot: 'T_CDFGH',  scheduledAt: '2026-06-30T21:00:00Z', thirdsFrom: ['C','D','F','G','H'] },
  { id: 'P78',  round: 'round_of_32', slot: 6,  homeSlot: 'E2',       awaySlot: 'I2',       scheduledAt: '2026-06-30T17:00:00Z', thirdsFrom: [] },
  { id: 'P79',  round: 'round_of_32', slot: 7,  homeSlot: 'A1',       awaySlot: 'T_CEFHI',  scheduledAt: '2026-07-01T01:00:00Z', thirdsFrom: ['C','E','F','H','I'] },
  { id: 'P80',  round: 'round_of_32', slot: 8,  homeSlot: 'L1',       awaySlot: 'T_EHIJK',  scheduledAt: '2026-07-01T16:00:00Z', thirdsFrom: ['E','H','I','J','K'] },
  { id: 'P81',  round: 'round_of_32', slot: 9,  homeSlot: 'D1',       awaySlot: 'T_BEFIJ',  scheduledAt: '2026-07-02T00:00:00Z', thirdsFrom: ['B','E','F','I','J'] },
  { id: 'P82',  round: 'round_of_32', slot: 10, homeSlot: 'G1',       awaySlot: 'T_AEHIJ',  scheduledAt: '2026-07-01T20:00:00Z', thirdsFrom: ['A','E','H','I','J'] },
  { id: 'P83',  round: 'round_of_32', slot: 11, homeSlot: 'K2',       awaySlot: 'L2',       scheduledAt: '2026-07-02T23:00:00Z', thirdsFrom: [] },
  { id: 'P84',  round: 'round_of_32', slot: 12, homeSlot: 'H1',       awaySlot: 'J2',       scheduledAt: '2026-07-02T19:00:00Z', thirdsFrom: [] },
  { id: 'P85',  round: 'round_of_32', slot: 13, homeSlot: 'B1',       awaySlot: 'T_EFGIJ',  scheduledAt: '2026-07-03T03:00:00Z', thirdsFrom: ['E','F','G','I','J'] },
  { id: 'P86',  round: 'round_of_32', slot: 14, homeSlot: 'J1',       awaySlot: 'H2',       scheduledAt: '2026-07-03T22:00:00Z', thirdsFrom: [] },
  { id: 'P87',  round: 'round_of_32', slot: 15, homeSlot: 'K1',       awaySlot: 'T_DEIJL',  scheduledAt: '2026-07-04T01:30:00Z', thirdsFrom: ['D','E','I','J','L'] },
  { id: 'P88',  round: 'round_of_32', slot: 16, homeSlot: 'D2',       awaySlot: 'G2',       scheduledAt: '2026-07-03T18:00:00Z', thirdsFrom: [] },
];

// ─── Octavos de final (R16) ───────────────────────────────────────────────────

export const R16_MATCHES: BracketMatch[] = [
  { id: 'P89',  round: 'round_of_16', slot: 1, homeSlot: 'P74', awaySlot: 'P77', scheduledAt: '2026-07-04T21:00:00Z', thirdsFrom: [] },
  { id: 'P90',  round: 'round_of_16', slot: 2, homeSlot: 'P73', awaySlot: 'P75', scheduledAt: '2026-07-04T17:00:00Z', thirdsFrom: [] },
  { id: 'P91',  round: 'round_of_16', slot: 3, homeSlot: 'P76', awaySlot: 'P78', scheduledAt: '2026-07-05T20:00:00Z', thirdsFrom: [] },
  { id: 'P92',  round: 'round_of_16', slot: 4, homeSlot: 'P79', awaySlot: 'P80', scheduledAt: '2026-07-06T00:00:00Z', thirdsFrom: [] },
  { id: 'P93',  round: 'round_of_16', slot: 5, homeSlot: 'P83', awaySlot: 'P84', scheduledAt: '2026-07-06T19:00:00Z', thirdsFrom: [] },
  { id: 'P94',  round: 'round_of_16', slot: 6, homeSlot: 'P81', awaySlot: 'P82', scheduledAt: '2026-07-07T00:00:00Z', thirdsFrom: [] },
  { id: 'P95',  round: 'round_of_16', slot: 7, homeSlot: 'P86', awaySlot: 'P88', scheduledAt: '2026-07-07T16:00:00Z', thirdsFrom: [] },
  { id: 'P96',  round: 'round_of_16', slot: 8, homeSlot: 'P85', awaySlot: 'P87', scheduledAt: '2026-07-07T20:00:00Z', thirdsFrom: [] },
];

// ─── Cuartos de final ─────────────────────────────────────────────────────────

export const QF_MATCHES: BracketMatch[] = [
  { id: 'P97',  round: 'quarterfinal', slot: 1, homeSlot: 'P89', awaySlot: 'P90', scheduledAt: '2026-07-09T20:00:00Z', thirdsFrom: [] },
  { id: 'P98',  round: 'quarterfinal', slot: 2, homeSlot: 'P93', awaySlot: 'P94', scheduledAt: '2026-07-10T19:00:00Z', thirdsFrom: [] },
  { id: 'P99',  round: 'quarterfinal', slot: 3, homeSlot: 'P91', awaySlot: 'P92', scheduledAt: '2026-07-11T21:00:00Z', thirdsFrom: [] },
  { id: 'P100', round: 'quarterfinal', slot: 4, homeSlot: 'P95', awaySlot: 'P96', scheduledAt: '2026-07-12T01:00:00Z', thirdsFrom: [] },
];

// ─── Semifinales ──────────────────────────────────────────────────────────────

export const SF_MATCHES: BracketMatch[] = [
  { id: 'P101', round: 'semifinal', slot: 1, homeSlot: 'P97',  awaySlot: 'P98',  scheduledAt: '2026-07-14T19:00:00Z', thirdsFrom: [] },
  { id: 'P102', round: 'semifinal', slot: 2, homeSlot: 'P99',  awaySlot: 'P100', scheduledAt: '2026-07-15T19:00:00Z', thirdsFrom: [] },
];

// ─── Tercer puesto + Final ────────────────────────────────────────────────────

export const FINAL_MATCHES: BracketMatch[] = [
  { id: 'P103', round: 'third_place', slot: 1, homeSlot: 'L_P101', awaySlot: 'L_P102', scheduledAt: '2026-07-18T21:00:00Z', thirdsFrom: [] },
  { id: 'P104', round: 'final',       slot: 1, homeSlot: 'P101',   awaySlot: 'P102',   scheduledAt: '2026-07-19T19:00:00Z', thirdsFrom: [] },
];

export const ALL_BRACKET_MATCHES: BracketMatch[] = [
  ...R32_MATCHES,
  ...R16_MATCHES,
  ...QF_MATCHES,
  ...SF_MATCHES,
  ...FINAL_MATCHES,
];

export const getBracketMatchById = (id: string): BracketMatch | null =>
  ALL_BRACKET_MATCHES.find(m => m.id === id) ?? null;

export function resolveSlot(
  slot: string,
  qualifiedSlots: Record<string, string | null>,
  bracketWinners: Record<string, string | null>,
  bracketLosers?: Record<string, string | null>,
): string | null {
  if (slot.startsWith('L_')) {
    const matchId = slot.slice(2);
    return bracketLosers?.[matchId] ?? null;
  }
  if (slot.startsWith('P')) {
    return bracketWinners[slot] ?? null;
  }
  if (slot.startsWith('T_')) {
    return null; // resolved via resolveThirdSlot
  }
  return qualifiedSlots[slot] ?? null;
}

export const ROUND_LABELS: Record<string, string> = {
  round_of_32:  'Dieciseisavos',
  round_of_16:  'Octavos',
  quarterfinal: 'Cuartos',
  semifinal:    'Semifinales',
  third_place:  'Tercer puesto',
  final:        'Final',
};

export const ROUND_POINTS_KEY: Record<string, keyof typeof import('@/lib/types').SCORE_RULES> = {
  round_of_32:  'KNOCKOUT_R32',
  round_of_16:  'KNOCKOUT_R16',
  quarterfinal: 'KNOCKOUT_QF',
  semifinal:    'KNOCKOUT_SF',
  final:        'KNOCKOUT_FINAL',
};
