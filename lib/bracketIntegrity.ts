/**
 * Integridad del bracket eliminatorio.
 *
 * Responsabilidad única: limpieza en cascada de picks downstream.
 *
 * Cuando el usuario cambia su pick en un cruce (ej. P73),
 * cualquier pick en rondas posteriores que dependía del ganador anterior
 * de ese cruce debe ser limpiado.
 *
 * El bracket ahora se apoya en datos oficiales de la DB.
 * Ya no se valida contra predicciones de grupo/terceros.
 */

import { ALL_BRACKET_MATCHES } from './data/bracket';

// ─── Mapa de dependencias ─────────────────────────────────────────────────────
//
// DEPENDENCY_MAP[matchId] = lista de matchIds que usan el ganador de matchId
// como uno de sus slots.
//
// Ejemplo: DEPENDENCY_MAP['P73'] = ['P90']
// significa que si cambia el ganador de P73, hay que revisar P90.

function buildDependencyMap(): Record<string, string[]> {
  const deps: Record<string, string[]> = {};

  for (const match of ALL_BRACKET_MATCHES) {
    for (const slot of [match.homeSlot, match.awaySlot]) {
      // Solo nos interesan slots que son IDs de partidos anteriores (empiezan por 'P')
      if (slot.startsWith('P')) {
        if (!deps[slot]) deps[slot] = [];
        deps[slot].push(match.id);
      }
    }
  }

  return deps;
}

const DEPENDENCY_MAP = buildDependencyMap();

// ─── Limpieza en cascada ──────────────────────────────────────────────────────

/**
 * Dado un conjunto de matchIds con picks inválidos, limpia esos picks
 * y recursivamente también todos los picks downstream que dependían de ellos.
 *
 * Devuelve un nuevo objeto bracketPreds limpio (inmutable).
 */
function cascadeClear(
  invalidMatchIds: string[],
  bracketPreds: Record<string, string | null>,
): Record<string, string | null> {
  if (invalidMatchIds.length === 0) return bracketPreds;

  const result    = { ...bracketPreds };
  const toProcess = [...invalidMatchIds];
  const visited   = new Set<string>();

  while (toProcess.length > 0) {
    const matchId = toProcess.pop()!;
    if (visited.has(matchId)) continue;
    visited.add(matchId);

    if (result[matchId] !== null && result[matchId] !== undefined) {
      result[matchId] = null;

      // Propagamos a los partidos que dependían de este
      const downstream = DEPENDENCY_MAP[matchId] ?? [];
      toProcess.push(...downstream);
    }
  }

  return result;
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Cuando el usuario cambia su pick en un cruce (matchId → newTeamId),
 * limpia en cascada cualquier pick downstream que hubiera elegido al equipo
 * que ya no avanza desde ese cruce.
 *
 * Ejemplo:
 *   - Antes: P73 = Argentina, P90 = Argentina (Argentina avanzaba desde P73)
 *   - Usuario cambia P73 = Brasil
 *   - Resultado: P90 = null (Argentina ya no puede estar en P90)
 *
 * @param matchId    Cruce cuyo pick ha cambiado
 * @param newTeamId  Nuevo ganador elegido (null si se borra el pick)
 * @param bracketPreds Estado actual de los picks
 */
export function clearDownstreamOnPickChange(
  matchId: string,
  newTeamId: string | null,
  bracketPreds: Record<string, string | null>,
): Record<string, string | null> {
  const downstreamMatches = DEPENDENCY_MAP[matchId] ?? [];
  if (downstreamMatches.length === 0) return bracketPreds;

  const previousWinner = bracketPreds[matchId];
  // Si no había pick previo, o el nuevo pick es el mismo, no hay nada que limpiar
  if (!previousWinner || previousWinner === newTeamId) return bracketPreds;

  // Buscar picks downstream que usaban al ganador anterior
  const invalidIds: string[] = [];
  for (const downstreamId of downstreamMatches) {
    if (bracketPreds[downstreamId] === previousWinner) {
      invalidIds.push(downstreamId);
    }
  }

  return cascadeClear(invalidIds, bracketPreds);
}
