/**
 * Utilidades para la predicción de la fase de grupos.
 *
 * El usuario elige el orden final de cada grupo: 1º, 2º, 3º, 4º.
 * No hay predicción de terceros — eso ha sido eliminado del sistema.
 */

import { GROUP_IDS } from './data/teams';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Mapa groupId → [1º, 2º, 3º, 4º] (con nulls para posiciones sin elegir) */
export type GroupOrders = Record<string, (string | null)[]>;

// ─── Validación ───────────────────────────────────────────────────────────────

/**
 * Un grupo está completo cuando los 4 equipos han sido ordenados.
 */
export function isGroupComplete(ranking: (string | null)[]): boolean {
  return ranking.length === 4 && ranking.every(t => t !== null && t !== '');
}

/**
 * Todos los grupos (A–L) están completos.
 */
export function areAllGroupsComplete(groupOrders: GroupOrders): boolean {
  return GROUP_IDS.every(gId => isGroupComplete(groupOrders[gId] ?? []));
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
