/**
 * Sistema de puntuación oficial — Mundial 2026
 *
 * Arquitectura nueva:
 *   1. scoreGroupOrder      — usuario predice 1º-4º de cada grupo
 *   2. scoreThirds          — usuario predice los 8 mejores terceros EN ORDEN
 *   3. scoreKnockoutPick    — picks de bracket (ganador de cada cruce)
 *   4. scoreBonusPrediction — score exacto de cualquier partido (+2 pts, separado)
 */

import { SCORE_RULES } from './types';

// ─── Tipos de resultado ───────────────────────────────────────────────────────

export interface GroupScoreResult {
  groupId: string;
  qualifierPts: number;   // SCORE_RULES.GROUP_QUALIFIER por cada equipo en top-2 correcto
  positionPts: number;    // SCORE_RULES.GROUP_POS_EXACT por cada posición exacta
  total: number;
  details: {
    teamId: string;
    qualifier: boolean;   // está en el top-2 oficial
    exactPosition: boolean; // además en la posición exacta (1º o 2º)
  }[];
}

export interface ThirdsScoreResult {
  selectedPts: number;    // SCORE_RULES.THIRDS_SELECTED por cada tercero correcto seleccionado
  orderPts: number;       // SCORE_RULES.THIRDS_ORDER por cada posición exacta
  total: number;
  details: {
    rank: number;         // 1-8 (posición en el ranking del usuario)
    teamId: string;
    selected: boolean;    // el equipo realmente avanzó como tercero
    exactRank: boolean;   // además en la posición exacta
  }[];
}

export interface KnockoutScoreResult {
  matchId: string;
  pts: number;
  isChampionBonus: boolean;
}

export interface BonusScoreResult {
  matchId: string;
  pts: number;  // 0 o SCORE_RULES.BONUS_EXACT_SCORE
  isExact: boolean;
}

export interface TotalScore {
  groupQualifier: number;
  groupPosition: number;
  thirdsSelected: number;
  thirdsOrder: number;
  knockoutPts: number;
  bonusScore: number;
  total: number;
}

// ─── Funciones de puntuación ──────────────────────────────────────────────────

/**
 * Puntúa la predicción de orden de un grupo.
 *
 * @param groupId         ID del grupo ('A'–'L')
 * @param predicted       Array [1º,2º,3º,4º] teamIds predichos por el usuario
 * @param officialTop2    Los 2 equipos reales que clasifican (en su orden oficial: [1º,2º])
 */
export function scoreGroupOrder(
  groupId: string,
  predicted: (string | null)[],
  officialTop2: [string, string] | null,
): GroupScoreResult {
  if (!officialTop2) {
    return { groupId, qualifierPts: 0, positionPts: 0, total: 0, details: [] };
  }

  const [off1, off2] = officialTop2;
  let qualifierPts = 0;
  let positionPts  = 0;

  const details: GroupScoreResult['details'] = [];

  // Evaluar las dos primeras posiciones predichas
  for (let i = 0; i < 2; i++) {
    const predTeam = predicted[i] ?? null;
    if (!predTeam) {
      details.push({ teamId: '', qualifier: false, exactPosition: false });
      continue;
    }

    const qualifier = predTeam === off1 || predTeam === off2;
    const exactPosition =
      (i === 0 && predTeam === off1) ||
      (i === 1 && predTeam === off2);

    if (qualifier) qualifierPts += SCORE_RULES.GROUP_QUALIFIER;
    if (exactPosition) positionPts += SCORE_RULES.GROUP_POS_EXACT;

    details.push({ teamId: predTeam, qualifier, exactPosition });
  }

  return {
    groupId,
    qualifierPts,
    positionPts,
    total: qualifierPts + positionPts,
    details,
  };
}

/**
 * Puntúa el ranking de 8 mejores terceros.
 *
 * @param predictedRanking  Array de 8 teamIds en orden del usuario (mejor→peor)
 * @param officialAdvancing Set de los 8 teamIds que realmente avanzaron como terceros
 * @param officialRanking   Array de los mismos 8 en su orden oficial (mejor→peor)
 *                          null si todavía no se conoce el orden oficial
 */
export function scoreThirds(
  predictedRanking: string[],
  officialAdvancing: Set<string> | null,
  officialRanking: string[] | null,
): ThirdsScoreResult {
  if (!officialAdvancing) {
    return { selectedPts: 0, orderPts: 0, total: 0, details: [] };
  }

  let selectedPts = 0;
  let orderPts    = 0;

  const details: ThirdsScoreResult['details'] = predictedRanking.slice(0, 8).map((teamId, idx) => {
    const rank     = idx + 1;
    const selected = officialAdvancing.has(teamId);
    const exactRank = selected && officialRanking !== null && officialRanking[idx] === teamId;

    if (selected) selectedPts += SCORE_RULES.THIRDS_SELECTED;
    if (exactRank) orderPts   += SCORE_RULES.THIRDS_ORDER;

    return { rank, teamId, selected, exactRank };
  });

  return { selectedPts, orderPts, total: selectedPts + orderPts, details };
}

/**
 * Puntúa el pick de eliminatoria de un cruce.
 *
 * @param matchId          ID del cruce ('P73'–'P104')
 * @param matchRound       Ronda del cruce
 * @param predictedWinner  teamId predicho como ganador (null = no predicho)
 * @param officialWinner   teamId real ganador (null = aún no jugado)
 * @param isChampionMatch  true si es la final (P104) — suma CHAMPION bonus
 */
export function scoreKnockoutPick(
  matchId: string,
  matchRound: string,
  predictedWinner: string | null,
  officialWinner: string | null,
  isChampionMatch = false,
): KnockoutScoreResult {
  if (!officialWinner || !predictedWinner) {
    return { matchId, pts: 0, isChampionBonus: false };
  }

  if (predictedWinner !== officialWinner) {
    return { matchId, pts: 0, isChampionBonus: false };
  }

  const roundPts: Record<string, number> = {
    round_of_32:  SCORE_RULES.KNOCKOUT_R32,
    round_of_16:  SCORE_RULES.KNOCKOUT_R16,
    quarterfinal: SCORE_RULES.KNOCKOUT_QF,
    semifinal:    SCORE_RULES.KNOCKOUT_SF,
    final:        SCORE_RULES.KNOCKOUT_FINAL,
  };

  let pts = roundPts[matchRound] ?? 0;
  if (isChampionMatch) pts += SCORE_RULES.CHAMPION;

  return { matchId, pts, isChampionBonus: isChampionMatch };
}

/**
 * Puntúa una predicción de score exacto (sistema bonus, independiente).
 *
 * @param matchId    ID del partido
 * @param predHome   Goles predichos local
 * @param predAway   Goles predichos visitante
 * @param offHome    Goles reales local (null = no terminado)
 * @param offAway    Goles reales visitante (null = no terminado)
 */
export function scoreBonusPrediction(
  matchId: string,
  predHome: number,
  predAway: number,
  offHome: number | null,
  offAway: number | null,
): BonusScoreResult {
  if (offHome === null || offAway === null) {
    return { matchId, pts: 0, isExact: false };
  }

  const isExact = predHome === offHome && predAway === offAway;
  return {
    matchId,
    pts: isExact ? SCORE_RULES.BONUS_EXACT_SCORE : 0,
    isExact,
  };
}

/**
 * Suma todos los parciales en un TotalScore.
 */
export function sumTotalScore(parts: {
  groupResults:  GroupScoreResult[];
  thirdsResult:  ThirdsScoreResult | null;
  knockoutResults: KnockoutScoreResult[];
  bonusResults:  BonusScoreResult[];
}): TotalScore {
  let groupQualifier = 0;
  let groupPosition  = 0;

  for (const g of parts.groupResults) {
    groupQualifier += g.qualifierPts;
    groupPosition  += g.positionPts;
  }

  const thirdsSelected = parts.thirdsResult?.selectedPts ?? 0;
  const thirdsOrder    = parts.thirdsResult?.orderPts    ?? 0;

  const knockoutPts = parts.knockoutResults.reduce((s, k) => s + k.pts, 0);
  const bonusScore  = parts.bonusResults.reduce((s, b) => s + b.pts, 0);

  const total =
    groupQualifier + groupPosition +
    thirdsSelected + thirdsOrder +
    knockoutPts + bonusScore;

  return {
    groupQualifier,
    groupPosition,
    thirdsSelected,
    thirdsOrder,
    knockoutPts,
    bonusScore,
    total,
  };
}

/**
 * Construye un TotalScore vacío (cero en todo).
 */
export function emptyTotalScore(): TotalScore {
  return {
    groupQualifier: 0,
    groupPosition:  0,
    thirdsSelected: 0,
    thirdsOrder:    0,
    knockoutPts:    0,
    bonusScore:     0,
    total:          0,
  };
}
