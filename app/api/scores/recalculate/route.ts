import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { scoreBonusPrediction, sumTotalScore } from '@/lib/scoring';

/**
 * Admin endpoint: recalculate bonus points after a match finishes.
 * POST /api/scores/recalculate  { matchId: 'A1' }
 *
 * Header: Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 *
 * Flow:
 *  1. Score match_bonus_predictions for the given match
 *  2. Recalculate leaderboard totals for affected users
 *  3. Update ranks
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { matchId } = await req.json();
  if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 });

  const supabase = createServiceClient();

  // Get official match result
  const { data: officialMatch } = await supabase
    .from('matches')
    .select('home_score, away_score, status')
    .eq('id', matchId)
    .single();

  if (!officialMatch || officialMatch.status !== 'finished') {
    return NextResponse.json({ error: 'Match not finished' }, { status: 400 });
  }

  // ── Score bonus predictions ──────────────────────────────────────────────

  const { data: bonusPreds } = await supabase
    .from('match_bonus_predictions')
    .select('id, user_id, home_score, away_score')
    .eq('match_id', matchId);

  const bonusUpdates: { id: string; user_id: string; pts: number }[] = [];

  for (const pred of bonusPreds ?? []) {
    const { pts } = scoreBonusPrediction(
      matchId,
      pred.home_score,
      pred.away_score,
      officialMatch.home_score,
      officialMatch.away_score,
    );
    bonusUpdates.push({ id: pred.id, user_id: pred.user_id, pts });
  }

  // Update individual bonus prediction points
  for (const u of bonusUpdates) {
    await supabase
      .from('match_bonus_predictions')
      .update({ points_earned: u.pts, locked: true })
      .eq('id', u.id);
  }

  // ── Recalculate leaderboard for affected users ────────────────────────────

  const userIds = Array.from(new Set(bonusUpdates.map(u => u.user_id)));

  for (const userId of userIds) {
    const { data: allBonus } = await supabase
      .from('match_bonus_predictions')
      .select('points_earned')
      .eq('user_id', userId);

    const bonusScore = allBonus?.reduce((s, p) => s + (p.points_earned ?? 0), 0) ?? 0;

    // Get current leaderboard values to preserve other categories
    const { data: current } = await supabase
      .from('leaderboard')
      .select('group_qualifier, group_position, thirds_selected, thirds_order, knockout_pts')
      .eq('user_id', userId)
      .maybeSingle();

    const total = sumTotalScore({
      groupResults:    [],
      thirdsResult:    null,
      knockoutResults: [],
      bonusResults:    [],
    }).total
      + (current?.group_qualifier  ?? 0)
      + (current?.group_position   ?? 0)
      + (current?.thirds_selected  ?? 0)
      + (current?.thirds_order     ?? 0)
      + (current?.knockout_pts     ?? 0)
      + bonusScore;

    await supabase
      .from('leaderboard')
      .upsert({
        user_id:      userId,
        bonus_score:  bonusScore,
        total_points: total,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'user_id' });
  }

  // ── Recalculate ranks ─────────────────────────────────────────────────────

  const { data: allLeaders } = await supabase
    .from('leaderboard')
    .select('user_id, total_points, rank')
    .order('total_points', { ascending: false });

  if (allLeaders) {
    for (let i = 0; i < allLeaders.length; i++) {
      await supabase
        .from('leaderboard')
        .update({ previous_rank: allLeaders[i].rank, rank: i + 1 })
        .eq('user_id', allLeaders[i].user_id);
    }
  }

  return NextResponse.json({ success: true, bonusUpdated: bonusUpdates.length });
}
