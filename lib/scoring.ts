/**
 * Sistema de puntuación — Mundial 2026
 *
 * Tres capas independientes y puras:
 *
 *   1. scoreGroupPrediction    — orden de grupo (2 pts/posición, 10 si grupo perfecto)
 *   2. scoreBracketPrediction  — ganador de cruce (5 pts planos)
 *   3. scoreMatchBonus         — predicción de score (1 resultado / 3 exacto, no acumulativo)
 *
 * Todas las funciones son puras: sin efectos secundarios, sin I/O.
 */

import { SCORE_RULES } from './types';

// ─── Tipos de resultado ───────────────────────────────────────────────────────

export interface GroupPredictionScore {
  groupId:      string;
  correctCount: number;   // 0–4 posiciones correctas
  isPerfect:    boolean;  // true si las 4 son correctas
  pts:          number;   // correctCount * 2; si isPerfect → 10
}

export interface BracketPredictionScore {
  matchId: string;
  correct: boolean;
  pts:     number;   // BRACKET_WINNER (5) si correcto, 0 si no
}

export interface MatchBonusScore {
  matchId:         string;
  isResultCorrect: boolean;
  isExact:         boolean;
  pts:             number;  // 0 | BONUS_RESULT (1) | BONUS_EXACT (3)
}

export interface TournamentScore {
  groupPts:   number;
  bracketPts: number;
  bonusPts:   number;
  total:      number;
}

// ─── Funciones de puntuación ──────────────────────────────────────────────────

/**
 * Puntúa la predicción de orden de un grupo.
 *
 * Regla:
 *   - 2 pts por cada posición correcta (de las 4).
 *   - Si las 4 son correctas → 10 pts totales (no 8).
 *     El bonus extra de 2 representa el "grupo perfecto".
 *
 * Ejemplos:
 *   0 correctas → 0 pts
 *   1 correcta  → 2 pts
 *   2 correctas → 4 pts
 *   3 correctas → 6 pts
 *   4 correctas → 10 pts  ← bonus de grupo perfecto
 *
 * @param groupId   Grupo ('A'–'L')
 * @param predicted Orden predicho por el usuario [1º, 2º, 3º, 4º] (puede tener nulls)
 * @param official  Orden final oficial [1º, 2º, 3º, 4º] (null si aún no disponible)
 */
export function scoreGroupPrediction(
  groupId: string,
  predicted: (string | null)[],
  official: string[] | null,
): GroupPredictionScore {
  if (!official || official.length < 4) {
    return { groupId, correctCount: 0, isPerfect: false, pts: 0 };
  }

  let correctCount = 0;
  for (let i = 0; i < 4; i++) {
    if (predicted[i] && predicted[i] === official[i]) {
      correctCount++;
    }
  }

  const isPerfect = correctCount === 4;
  const pts = isPerfect
    ? SCORE_RULES.GROUP_POSITION * 4 + SCORE_RULES.GROUP_PERFECT_BONUS  // 8 + 2 = 10
    : correctCount * SCORE_RULES.GROUP_POSITION;

  return { groupId, correctCount, isPerfect, pts };
}

/**
 * Puntúa todas las predicciones de grupo de un usuario en un pase.
 *
 * @param predicted Mapa groupId → [1º, 2º, 3º, 4º] predichos
 * @param official  Mapa groupId → [1º, 2º, 3º, 4º] oficiales (null para grupos no terminados)
 */
export function scoreAllGroupPredictions(
  predicted: Record<string, (string | null)[]>,
  official:  Record<string, string[] | null>,
): { results: GroupPredictionScore[]; totalGroupPts: number } {
  const results = Object.keys(predicted).map(groupId =>
    scoreGroupPrediction(groupId, predicted[groupId], official[groupId] ?? null),
  );
  const totalGroupPts = results.reduce((s, r) => s + r.pts, 0);
  return { results, totalGroupPts };
}

/**
 * Puntúa el pick de ganador de un cruce eliminatorio.
 *
 * Regla: 5 pts planos si el ganador predicho coincide con el oficial.
 * No hay distinción por ronda (mismos puntos en R32, R16, QF, SF, Final).
 *
 * @param matchId          ID del cruce (P73–P104)
 * @param predictedWinner  teamId predicho como ganador (null = no predicho)
 * @param officialWinner   teamId del ganador oficial (null = aún no jugado)
 */
export function scoreBracketPrediction(
  matchId: string,
  predictedWinner: string | null,
  officialWinner: string | null,
): BracketPredictionScore {
  if (!predictedWinner || !officialWinner) {
    return { matchId, correct: false, pts: 0 };
  }
  const correct = predictedWinner === officialWinner;
  return { matchId, correct, pts: correct ? SCORE_RULES.BRACKET_WINNER : 0 };
}

/**
 * Puntúa una predicción de score de partido (sistema bonus).
 *
 * Reglas (NO acumulativas):
 *   - 0 pts si el resultado (V/E/D) no es correcto.
 *   - 1 pt si el resultado es correcto pero el score exacto no.
 *   - 3 pts en total si el score exacto es correcto.
 *     (No son 1+3=4. El score exacto implica automáticamente resultado correcto,
 *      y se puntúa como 3 en total, no como 4.)
 *
 * @param matchId  ID del partido
 * @param predHome Goles locales predichos
 * @param predAway Goles visitantes predichos
 * @param offHome  Goles locales oficiales (null si no terminado)
 * @param offAway  Goles visitantes oficiales (null si no terminado)
 */
export function scoreMatchBonus(
  matchId: string,
  predHome: number,
  predAway: number,
  offHome: number | null,
  offAway: number | null,
): MatchBonusScore {
  if (offHome === null || offAway === null) {
    return { matchId, isResultCorrect: false, isExact: false, pts: 0 };
  }

  const isExact = predHome === offHome && predAway === offAway;

  // Math.sign: -1 (away wins), 0 (draw), 1 (home wins)
  const predResult = Math.sign(predHome - predAway);
  const offResult  = Math.sign(offHome  - offAway);
  const isResultCorrect = predResult === offResult;

  let pts = 0;
  if (isExact) {
    pts = SCORE_RULES.BONUS_EXACT;     // 3 pts total
  } else if (isResultCorrect) {
    pts = SCORE_RULES.BONUS_RESULT;    // 1 pt
  }

  return { matchId, isResultCorrect, isExact, pts };
}

/**
 * Combina los tres pilares de puntuación en un total.
 */
export function scoreTournament(
  groupPts:   number,
  bracketPts: number,
  bonusPts:   number,
): TournamentScore {
  return {
    groupPts,
    bracketPts,
    bonusPts,
    total: groupPts + bracketPts + bonusPts,
  };
}
