import { SCORE_RULES } from './types';
import type { Match, MatchPrediction, ScoreBreakdown } from './types';

/**
 * SCORING SYSTEM
 *
 * Group phase:
 *   +2 pts  — correct result (W/D/L)
 *   +5 pts  — exact score (replaces the +2, total is +5)
 *
 * Group position:
 *   +5 pts  — correct 1st place in group
 *   +3 pts  — correct 2nd place in group
 *
 * Best thirds:
 *   +2 pts  — correctly predicted a 3rd-place team that advances
 *
 * Knockout rounds:
 *   +5 pts  — correct team advancing (per match, per round)
 *   +8 pts  — exact score in a knockout match (bonus on top of advance pts)
 *
 * Milestones:
 *   +5 pts  — correct semifinalist (each)
 *   +10 pts — correct finalist (each)
 *   +25 pts — champion
 */

export function scoreGroupMatch(
  match: Match,
  prediction: MatchPrediction | undefined,
): { pts: number; type: 'exact' | 'correct' | 'wrong' | 'pending' } {
  if (match.status !== 'finished' || match.homeScore === null || match.awayScore === null) {
    return { pts: 0, type: 'pending' };
  }
  if (!prediction) return { pts: 0, type: 'wrong' };

  const actualResult = Math.sign(match.homeScore - match.awayScore);
  const predResult   = Math.sign(prediction.homeScore - prediction.awayScore);

  if (actualResult !== predResult) return { pts: 0, type: 'wrong' };

  if (prediction.homeScore === match.homeScore && prediction.awayScore === match.awayScore) {
    return { pts: SCORE_RULES.EXACT_SCORE_GROUP, type: 'exact' };
  }
  return { pts: SCORE_RULES.CORRECT_RESULT_GROUP, type: 'correct' };
}

export function scoreGroupPositions(
  actualOrder: string[],   // [1st, 2nd, 3rd, 4th] team IDs
  predictedOrder: string[], // [1st, 2nd, 3rd, 4th] team IDs
): number {
  if (!actualOrder.length || !predictedOrder.length) return 0;
  let pts = 0;
  if (predictedOrder[0] && predictedOrder[0] === actualOrder[0]) pts += SCORE_RULES.GROUP_POS_1ST;
  if (predictedOrder[1] && predictedOrder[1] === actualOrder[1]) pts += SCORE_RULES.GROUP_POS_2ND;
  return pts;
}

export function scoreThirdQualifier(
  qualifiedThirdIds: string[], // list of 8 advancing thirds
  predictedThird: string | undefined,
): number {
  if (!predictedThird) return 0;
  return qualifiedThirdIds.includes(predictedThird) ? SCORE_RULES.THIRD_QUALIFIER : 0;
}

export function scoreKnockoutMatch(
  actualWinnerId: string | null,
  actualHomeScore: number | null,
  actualAwayScore: number | null,
  predictedWinnerId: string | null,
  predictedHomeScore: number | null,
  predictedAwayScore: number | null,
): { pts: number; type: 'exact' | 'correct' | 'wrong' | 'pending' } {
  if (!actualWinnerId) return { pts: 0, type: 'pending' };
  if (!predictedWinnerId || actualWinnerId !== predictedWinnerId) return { pts: 0, type: 'wrong' };

  let pts = SCORE_RULES.KNOCKOUT_ADVANCE;

  if (
    actualHomeScore !== null &&
    actualAwayScore !== null &&
    predictedHomeScore !== null &&
    predictedAwayScore !== null &&
    predictedHomeScore === actualHomeScore &&
    predictedAwayScore === actualAwayScore
  ) {
    pts += SCORE_RULES.EXACT_SCORE_KNOCKOUT;
    return { pts, type: 'exact' };
  }

  return { pts, type: 'correct' };
}

export function buildEmptyBreakdown(): ScoreBreakdown {
  return {
    exactScore: 0,
    correctResult: 0,
    groupPosition: 0,
    thirdQualifier: 0,
    knockoutAdvance: 0,
    exactKnockout: 0,
    semifinalist: 0,
    finalist: 0,
    champion: 0,
    total: 0,
  };
}

export function sumBreakdown(b: ScoreBreakdown): number {
  return (
    b.exactScore +
    b.correctResult +
    b.groupPosition +
    b.thirdQualifier +
    b.knockoutAdvance +
    b.exactKnockout +
    b.semifinalist +
    b.finalist +
    b.champion
  );
}
