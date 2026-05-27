/**
 * Utilidades para la predicción estructural del torneo.
 *
 * El usuario elige:
 *   1. Orden final de cada grupo (1º–4º)
 *   2. Los 8 mejores terceros en orden de mejor a peor
 *
 * Estas dos entradas determinan determinísticamente:
 *   - qualifiedSlots (A1, A2, ... L1, L2, T1-T8)
 *   - thirdGroups (T1 → 'A', T2 → 'C', ...)
 *
 * Que a su vez permiten resolver el bracket completo.
 */

import { GROUP_IDS } from './data/teams';

// ─── Tipos internos ───────────────────────────────────────────────────────────

export type GroupOrders = Record<string, (string | null)[]>; // groupId → [1º,2º,3º,4º]
export type ThirdsRanking = string[];                         // ordered 8 team IDs

// ─── De órdenes de grupo a slots clasificados ─────────────────────────────────

/**
 * Convierte las predicciones de orden de grupo en el mapa de slots clasificados.
 * A1 = 1º del grupo A, A2 = 2º del grupo A, etc.
 */
export function groupOrdersToQualifiedSlots(
  groupOrders: GroupOrders,
): Record<string, string | null> {
  const slots: Record<string, string | null> = {};

  for (const gId of GROUP_IDS) {
    const ranking = groupOrders[gId] ?? [null, null, null, null];
    slots[`${gId}1`] = ranking[0] ?? null;
    slots[`${gId}2`] = ranking[1] ?? null;
  }

  return slots;
}

/**
 * Obtiene el equipo predicho como 3º de cada grupo.
 * Devuelve un mapa teamId → groupId (para los 12 terceros).
 */
export function getPredictedThirds(
  groupOrders: GroupOrders,
): Record<string, string> {
  // teamId → groupId
  const map: Record<string, string> = {};

  for (const gId of GROUP_IDS) {
    const ranking = groupOrders[gId] ?? [null, null, null, null];
    const third = ranking[2] ?? null;
    if (third) {
      map[third] = gId;
    }
  }

  return map;
}

/**
 * Lista los 12 equipos predichos como 3º clasificado de cada grupo,
 * en orden de grupo (A→L). Devuelve null si el grupo aún no tiene 3º predicho.
 */
export function getThirdsByGroupOrdered(
  groupOrders: GroupOrders,
): Array<{ groupId: string; teamId: string | null }> {
  return GROUP_IDS.map(gId => ({
    groupId: gId,
    teamId: (groupOrders[gId] ?? [])[2] ?? null,
  }));
}

// ─── De ranking de terceros a slots T1-T8 ────────────────────────────────────

/**
 * Convierte el ranking de 8 mejores terceros del usuario en los slots T1-T8.
 * Necesita saber qué equipo viene de qué grupo (de las predicciones de grupo).
 *
 * @param thirdsRanking  Array de 8 teamIds en orden de mejor a peor
 * @param teamToGroup    Mapa teamId→groupId para todos los posibles terceros
 */
export function thirdsRankingToSlotsAndGroups(
  thirdsRanking: ThirdsRanking,
  teamToGroup: Record<string, string>,
): {
  slots: Record<string, string | null>;
  thirdGroups: Record<string, string>;
} {
  const slots: Record<string, string | null> = {};
  const thirdGroups: Record<string, string> = {};

  for (let i = 0; i < 8; i++) {
    const key    = `T${i + 1}`;
    const teamId = thirdsRanking[i] ?? null;
    slots[key]   = teamId;
    if (teamId && teamToGroup[teamId]) {
      thirdGroups[key] = teamToGroup[teamId];
    }
  }

  return { slots, thirdGroups };
}

/**
 * Convierte groupOrders + thirdsRanking en el mapa completo de slots:
 * A1…L2 (grupo) + T1…T8 (terceros) + thirdGroups
 */
export function buildQualifiedSlots(
  groupOrders: GroupOrders,
  thirdsRanking: ThirdsRanking,
): {
  slots: Record<string, string | null>;
  thirdGroups: Record<string, string>;
} {
  const groupSlots  = groupOrdersToQualifiedSlots(groupOrders);
  const teamToGroup = getPredictedThirds(groupOrders);
  const { slots: thirdSlots, thirdGroups } = thirdsRankingToSlotsAndGroups(thirdsRanking, teamToGroup);

  return {
    slots: { ...groupSlots, ...thirdSlots },
    thirdGroups,
  };
}

// ─── Validación ───────────────────────────────────────────────────────────────

/**
 * Un grupo está completo si los 4 equipos han sido ordenados.
 */
export function isGroupComplete(ranking: (string | null)[]): boolean {
  return ranking.length === 4 && ranking.every(t => t !== null && t !== '');
}

/**
 * Todos los grupos están completos.
 */
export function areAllGroupsComplete(groupOrders: GroupOrders): boolean {
  return GROUP_IDS.every(gId => isGroupComplete(groupOrders[gId] ?? []));
}

/**
 * Los 8 mejores terceros están seleccionados y en orden.
 */
export function isThirdsComplete(thirdsRanking: ThirdsRanking): boolean {
  return thirdsRanking.length === 8 && thirdsRanking.every(t => t !== null && t !== '');
}

/**
 * Cuántos grupos están completamente ordenados.
 */
export function completedGroupsCount(groupOrders: GroupOrders): number {
  return GROUP_IDS.filter(gId => isGroupComplete(groupOrders[gId] ?? [])).length;
}

/**
 * El ranking de un grupo es válido si no tiene equipos repetidos.
 */
export function isGroupRankingValid(ranking: (string | null)[]): boolean {
  const filled = ranking.filter(Boolean);
  return filled.length === new Set(filled).size;
}
