import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { PREDICTION_LOCK_DATE } from './types';
import type { Team } from './types';
import { GROUP_MATCHES } from './data/matches';
import { getTeamsByGroup, getTeamById } from './data/teams';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isPredictionLocked(): boolean {
  return isPast(PREDICTION_LOCK_DATE);
}

export function formatMatchDate(iso: string): string {
  return format(new Date(iso), "d MMM · HH:mm", { locale: es });
}

export function formatRelativeDate(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es });
}

export function getMatchResult(homeScore: number | null, awayScore: number | null) {
  if (homeScore === null || awayScore === null) return null;
  if (homeScore > awayScore) return 'home';
  if (awayScore > homeScore) return 'away';
  return 'draw';
}

export function getResultLabel(
  result: 'home' | 'away' | 'draw' | null,
  homeTeam: string,
  awayTeam: string,
): string {
  if (!result) return '–';
  if (result === 'draw') return 'Empate';
  return result === 'home' ? homeTeam : awayTeam;
}

// ─── Standing types ───────────────────────────────────────────────────────────

export interface PredStanding {
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

// ─── FIFA Tiebreaker implementation ──────────────────────────────────────────
//
// Order (applies first to a group of tied teams, then reduced as teams separate):
// 1. Points in head-to-head matches among tied teams
// 2. Goal difference in head-to-head matches among tied teams
// 3. Goals scored in head-to-head matches among tied teams
// 4. Goal difference across all group matches
// 5. Goals scored across all group matches
// 6. Fair play (not tracked → fallback: skip)
// 7. FIFA ranking (lower number = better; tied teams sorted by ascending rank)

type MatchResult = { h: string; a: string; hg: number; ag: number };

function headToHead(
  teams: string[],
  allResults: MatchResult[],
): Record<string, { pts: number; gd: number; gf: number }> {
  const h2h: Record<string, { pts: number; gd: number; gf: number }> = {};
  teams.forEach(t => { h2h[t] = { pts: 0, gd: 0, gf: 0 }; });

  for (const r of allResults) {
    if (!teams.includes(r.h) || !teams.includes(r.a)) continue;
    h2h[r.h].gf += r.hg;
    h2h[r.h].gd += r.hg - r.ag;
    h2h[r.a].gf += r.ag;
    h2h[r.a].gd += r.ag - r.hg;
    if (r.hg > r.ag) { h2h[r.h].pts += 3; }
    else if (r.ag > r.hg) { h2h[r.a].pts += 3; }
    else { h2h[r.h].pts += 1; h2h[r.a].pts += 1; }
  }
  return h2h;
}

function sortGroup(
  standings: PredStanding[],
  allResults: MatchResult[],
  teams: Team[],
  depth = 0,
): PredStanding[] {
  if (standings.length <= 1 || depth > 5) return standings;

  // Separate into tied groups by points
  const groups: PredStanding[][] = [];
  let i = 0;
  while (i < standings.length) {
    let j = i + 1;
    while (j < standings.length && standings[j].pts === standings[i].pts) j++;
    groups.push(standings.slice(i, j));
    i = j;
  }

  return groups.flatMap(group => {
    if (group.length === 1) return group;

    const ids = group.map(s => s.teamId);
    const h2h = headToHead(ids, allResults);

    // Check if H2H resolves
    const sorted = [...group].sort((a, b) => {
      const ah = h2h[a.teamId], bh = h2h[b.teamId];
      if (bh.pts !== ah.pts) return bh.pts - ah.pts;
      if (bh.gd  !== ah.gd)  return bh.gd  - ah.gd;
      if (bh.gf  !== ah.gf)  return bh.gf  - ah.gf;
      // Overall GD
      if (b.gd !== a.gd) return b.gd - a.gd;
      // Overall GF
      if (b.gf !== a.gf) return b.gf - a.gf;
      // FIFA rank (lower = better)
      const aTeam = teams.find(t => t.id === a.teamId);
      const bTeam = teams.find(t => t.id === b.teamId);
      const aRank = aTeam?.fifaRank ?? 999;
      const bRank = bTeam?.fifaRank ?? 999;
      return aRank - bRank;
    });

    return sorted;
  });
}

// ─── Compute group standings from user predictions ─────────────────────────

export function computeGroupStandings(
  groupId: string,
  predictions: Record<string, { homeScore: number; awayScore: number }>,
): PredStanding[] {
  const matches = GROUP_MATCHES.filter(m => m.group === groupId);
  const teams = getTeamsByGroup(groupId);

  const stats: Record<string, PredStanding> = {};
  teams.forEach(t => {
    stats[t.id] = { teamId: t.id, pts: 0, gf: 0, ga: 0, gd: 0, won: 0, drawn: 0, lost: 0, played: 0 };
  });

  const results: MatchResult[] = [];

  for (const match of matches) {
    const pred = predictions[match.id];
    if (!pred || !match.homeTeam || !match.awayTeam) continue;
    const h = match.homeTeam.id;
    const a = match.awayTeam.id;
    if (!stats[h] || !stats[a]) continue;

    const hg = pred.homeScore;
    const ag = pred.awayScore;

    stats[h].played++; stats[a].played++;
    stats[h].gf += hg; stats[h].ga += ag;
    stats[a].gf += ag; stats[a].ga += hg;

    if (hg > ag) {
      stats[h].pts += 3; stats[h].won++;
      stats[a].lost++;
    } else if (ag > hg) {
      stats[a].pts += 3; stats[a].won++;
      stats[h].lost++;
    } else {
      stats[h].pts += 1; stats[h].drawn++;
      stats[a].pts += 1; stats[a].drawn++;
    }

    results.push({ h, a, hg, ag });
  }

  const list = Object.values(stats).map(s => ({ ...s, gd: s.gf - s.ga }));
  // Initial sort by pts, then apply full tiebreaker
  list.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  return sortGroup(list, results, teams);
}

// ─── Compute all qualified slots from group predictions ─────────────────────
//
// Returns Record with keys like A1, A2, B1, B2, ..., L1, L2, T1–T8.
// T1–T8 are the best 8 thirds sorted by pts > gd > gf > FIFA rank.
// thirdGroups maps T1–T8 slot to the group it came from.

export interface QualifiedSlots {
  slots: Record<string, string | null>;
  // Maps T1-T8 slot key to the source group id
  thirdGroups: Record<string, string>;
}

export function computeQualifiedSlots(
  predictions: Record<string, { homeScore: number; awayScore: number }>,
): Record<string, string | null> {
  return computeQualifiedSlotsWithGroups(predictions).slots;
}

export function computeQualifiedSlotsWithGroups(
  predictions: Record<string, { homeScore: number; awayScore: number }>,
): QualifiedSlots {
  const slots: Record<string, string | null> = {};
  const thirdGroups: Record<string, string> = {};
  const thirds: { teamId: string; groupId: string; pts: number; gd: number; gf: number; fifaRank: number }[] = [];

  for (const gId of ['A','B','C','D','E','F','G','H','I','J','K','L']) {
    const standings = computeGroupStandings(gId, predictions);
    slots[`${gId}1`] = standings[0]?.teamId ?? null;
    slots[`${gId}2`] = standings[1]?.teamId ?? null;
    if (standings[2]) {
      const t = getTeamById(standings[2].teamId);
      thirds.push({
        teamId: standings[2].teamId,
        groupId: gId,
        pts: standings[2].pts,
        gd: standings[2].gd,
        gf: standings[2].gf,
        fifaRank: t?.fifaRank ?? 999,
      });
    }
  }

  // Best 8 thirds: pts > gd > gf > FIFA rank
  thirds.sort((a, b) =>
    b.pts - a.pts ||
    b.gd  - a.gd  ||
    b.gf  - a.gf  ||
    a.fifaRank - b.fifaRank,
  );

  thirds.slice(0, 8).forEach((t, i) => {
    slots[`T${i + 1}`] = t.teamId;
    thirdGroups[`T${i + 1}`] = t.groupId;
  });

  return { slots, thirdGroups };
}

/**
 * Resolve a T_XYZ slot (e.g. T_ABCDF) to the actual teamId.
 * Looks up which T1-T8 thirds come from the allowed groups.
 */
export function resolveThirdSlot(
  allowedGroups: string[],   // e.g. ['A','B','C','D','F']
  slots: Record<string, string | null>,
  thirdGroups: Record<string, string>,
): string | null {
  for (let i = 1; i <= 8; i++) {
    const tKey = `T${i}`;
    const sourceGroup = thirdGroups[tKey];
    if (sourceGroup && allowedGroups.includes(sourceGroup)) {
      return slots[tKey] ?? null;
    }
  }
  return null;
}

// ─── Real standings from official match results ────────────────────────────

export function calculateGroupStandings(
  teams: Team[],
  matches: Array<{
    homeTeam: { id: string } | null;
    awayTeam: { id: string } | null;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
  }>,
): PredStanding[] {
  const stats: Record<string, PredStanding> = {};
  teams.forEach(t => {
    stats[t.id] = { teamId: t.id, pts: 0, gf: 0, ga: 0, gd: 0, won: 0, drawn: 0, lost: 0, played: 0 };
  });

  const results: MatchResult[] = [];

  for (const match of matches) {
    if (match.status !== 'finished' || match.homeScore === null || match.awayScore === null) continue;
    const h = match.homeTeam?.id;
    const a = match.awayTeam?.id;
    if (!h || !a || !stats[h] || !stats[a]) continue;

    const hg = match.homeScore, ag = match.awayScore;
    stats[h].played++; stats[a].played++;
    stats[h].gf += hg; stats[h].ga += ag;
    stats[a].gf += ag; stats[a].ga += hg;

    if (hg > ag) { stats[h].pts += 3; stats[h].won++; stats[a].lost++; }
    else if (ag > hg) { stats[a].pts += 3; stats[a].won++; stats[h].lost++; }
    else { stats[h].pts++; stats[h].drawn++; stats[a].pts++; stats[a].drawn++; }

    results.push({ h, a, hg, ag });
  }

  const list = Object.values(stats).map(s => ({ ...s, gd: s.gf - s.ga }));
  list.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  return sortGroup(list, results, teams);
}
