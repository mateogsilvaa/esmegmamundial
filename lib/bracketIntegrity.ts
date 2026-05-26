/**
 * Bracket integrity utilities.
 *
 * Responsible for:
 * 1. Resolving the valid two teams for each bracket match slot.
 * 2. Cascade-clearing downstream picks when an upstream pick changes.
 * 3. Validating that no team appears as winner in two incompatible match slots.
 */

import { ALL_BRACKET_MATCHES } from './data/bracket';
import { resolveThirdSlot } from './utils';

// ─── Resolve valid teams for a bracket match ─────────────────────────────────

function resolveSlotTeam(
  slot: string,
  qualifiedSlots: Record<string, string | null>,
  thirdGroups: Record<string, string>,
  bracketWinners: Record<string, string | null>,
): string | null {
  if (slot.startsWith('T_')) {
    const groups = slot.slice(2).split('');
    return resolveThirdSlot(groups, qualifiedSlots, thirdGroups);
  }
  if (slot.startsWith('P')) {
    return bracketWinners[slot] ?? null;
  }
  if (slot.startsWith('L_')) return null;
  return qualifiedSlots[slot] ?? null;
}

export function getValidTeamsForMatch(
  matchId: string,
  qualifiedSlots: Record<string, string | null>,
  thirdGroups: Record<string, string>,
  bracketPreds: Record<string, string | null>,
): [string | null, string | null] {
  const match = ALL_BRACKET_MATCHES.find(m => m.id === matchId);
  if (!match) return [null, null];

  const homeId = resolveSlotTeam(match.homeSlot, qualifiedSlots, thirdGroups, bracketPreds);
  const awayId = resolveSlotTeam(match.awaySlot, qualifiedSlots, thirdGroups, bracketPreds);
  return [homeId, awayId];
}

// ─── Build dependency map ─────────────────────────────────────────────────────
// downstream[P73] = ['P90'] means: if P73's winner changes, P90 must be rechecked.

function buildDependencyMap(): Record<string, string[]> {
  const deps: Record<string, string[]> = {};
  for (const match of ALL_BRACKET_MATCHES) {
    for (const slot of [match.homeSlot, match.awaySlot]) {
      if (slot.startsWith('P')) {
        if (!deps[slot]) deps[slot] = [];
        deps[slot].push(match.id);
      }
    }
  }
  return deps;
}

const DEPENDENCY_MAP = buildDependencyMap();

// ─── Cascade clear ────────────────────────────────────────────────────────────

/**
 * Given a set of matchIds whose picks have become invalid,
 * recursively clear those picks and all downstream picks.
 *
 * Returns the cleaned bracketPreds object.
 */
function cascadeClear(
  invalidMatchIds: string[],
  bracketPreds: Record<string, string | null>,
): Record<string, string | null> {
  if (invalidMatchIds.length === 0) return bracketPreds;

  const result = { ...bracketPreds };
  const toProcess = [...invalidMatchIds];
  const visited = new Set<string>();

  while (toProcess.length > 0) {
    const matchId = toProcess.pop()!;
    if (visited.has(matchId)) continue;
    visited.add(matchId);

    // Clear this pick
    if (result[matchId] !== undefined && result[matchId] !== null) {
      result[matchId] = null;

      // Add downstream matches that depended on this pick
      const downstreamMatches = DEPENDENCY_MAP[matchId] ?? [];
      toProcess.push(...downstreamMatches);
    }
  }

  return result;
}

// ─── Validate and clean bracket after group changes ───────────────────────────

/**
 * After group scores change, revalidate all bracket picks.
 * Clears any pick where the picked team is no longer a valid option
 * for that match, and cascades the clearing downstream.
 */
export function validateAndCleanBracket(
  bracketPreds: Record<string, string | null>,
  qualifiedSlots: Record<string, string | null>,
  thirdGroups: Record<string, string>,
): Record<string, string | null> {
  // Process in bracket order: R32 → R16 → QF → SF → Final
  let current = { ...bracketPreds };
  const invalidIds: string[] = [];

  for (const match of ALL_BRACKET_MATCHES) {
    const picked = current[match.id];
    if (!picked) continue;

    const [homeId, awayId] = getValidTeamsForMatch(match.id, qualifiedSlots, thirdGroups, current);
    if (picked !== homeId && picked !== awayId) {
      invalidIds.push(match.id);
    }
  }

  if (invalidIds.length === 0) return bracketPreds;
  return cascadeClear(invalidIds, current);
}

// ─── Validate when a single bracket pick changes ──────────────────────────────

/**
 * When the user changes a bracket pick, clear all downstream picks
 * that relied on the previous winner from that match slot.
 *
 * e.g., if user changes P73 winner from ArgId → BraId,
 * any pick in P90 (which uses winner of P73) must be cleared
 * if it was ArgId (which no longer advances from P73).
 */
export function clearDownstreamOnPickChange(
  matchId: string,
  newTeamId: string | null,
  bracketPreds: Record<string, string | null>,
): Record<string, string | null> {
  const downstreamMatches = DEPENDENCY_MAP[matchId] ?? [];
  if (downstreamMatches.length === 0) return bracketPreds;

  // If the previous winner is now gone, cascade clear
  const prev = bracketPreds[matchId];
  if (!prev || prev === newTeamId) return bracketPreds;

  // The previous winner (prev) might still be in downstream picks — clear those
  const invalidIds: string[] = [];
  for (const downstreamId of downstreamMatches) {
    if (bracketPreds[downstreamId] === prev) {
      invalidIds.push(downstreamId);
    }
  }

  return cascadeClear(invalidIds, bracketPreds);
}
