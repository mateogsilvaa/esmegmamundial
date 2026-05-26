import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getTeamById } from '@/lib/data/teams';
import { getMatchById } from '@/lib/data/matches';
import { scoreGroupMatch } from '@/lib/scoring';
import { SCORE_RULES } from '@/lib/types';

/**
 * Admin endpoint: recalculate points for all users after a match finishes.
 * POST /api/scores/recalculate  { matchId: 'A1' }
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
    .select('*')
    .eq('id', matchId)
    .single();

  if (!officialMatch || officialMatch.status !== 'finished') {
    return NextResponse.json({ error: 'Match not finished' }, { status: 400 });
  }

  const staticMatch = getMatchById(matchId);
  if (!staticMatch) return NextResponse.json({ error: 'Match not found in static data' }, { status: 404 });

  const match = {
    ...staticMatch,
    homeScore: officialMatch.home_score,
    awayScore: officialMatch.away_score,
    status: 'finished' as const,
  };

  // Get all predictions for this match
  const { data: predictions } = await supabase
    .from('predictions')
    .select('id, user_id, home_score, away_score')
    .eq('match_id', matchId);

  if (!predictions?.length) return NextResponse.json({ success: true, updated: 0 });

  // Score each prediction
  const updates = predictions.map(pred => {
    const { pts } = scoreGroupMatch(match, {
      matchId,
      homeScore: pred.home_score,
      awayScore: pred.away_score,
    });

    return { id: pred.id, user_id: pred.user_id, pts };
  });

  // Update prediction points
  for (const u of updates) {
    await supabase
      .from('predictions')
      .update({ points_earned: u.pts })
      .eq('id', u.id);
  }

  // Recalculate leaderboard totals for affected users
  const userIds = Array.from(new Set(updates.map(u => u.user_id)));
  for (const userId of userIds) {
    const { data: allPreds } = await supabase
      .from('predictions')
      .select('points_earned')
      .eq('user_id', userId);

    const total = allPreds?.reduce((sum, p) => sum + (p.points_earned ?? 0), 0) ?? 0;

    await supabase
      .from('leaderboard')
      .upsert({ user_id: userId, total_points: total, last_updated: new Date().toISOString() }, {
        onConflict: 'user_id',
      });
  }

  // Recalculate ranks
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

  return NextResponse.json({ success: true, updated: updates.length });
}
