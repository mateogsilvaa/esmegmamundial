import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ─── GET /api/bonus ────────────────────────────────────────────────────────────
// Returns all bonus predictions for the current user.
// Optional ?matchId=P73 filter to get a single match prediction.

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get('matchId');

  let query = supabase
    .from('match_bonus_predictions')
    .select('match_id, home_score, away_score, points_earned, locked')
    .eq('user_id', user.id);

  if (matchId) {
    query = query.eq('match_id', matchId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

// ─── POST /api/bonus ───────────────────────────────────────────────────────────
// Creates or updates a bonus score prediction for a single match.
// Body: { matchId: string, homeScore: number, awayScore: number }
// Rejects if the match has already started (live/finished) or is locked in DB.

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { matchId?: string; homeScore?: number; awayScore?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { matchId, homeScore, awayScore } = body;

  if (!matchId || homeScore === undefined || awayScore === undefined) {
    return NextResponse.json({ error: 'Missing fields: matchId, homeScore, awayScore' }, { status: 400 });
  }

  if (
    !Number.isInteger(homeScore) || !Number.isInteger(awayScore) ||
    homeScore < 0 || awayScore < 0 ||
    homeScore > 20 || awayScore > 20
  ) {
    return NextResponse.json({ error: 'Scores must be integers 0–20' }, { status: 400 });
  }

  // Guard: check if the existing DB prediction is locked (scoring already happened)
  const { data: existing } = await supabase
    .from('match_bonus_predictions')
    .select('locked')
    .eq('user_id', user.id)
    .eq('match_id', matchId)
    .maybeSingle();

  if (existing?.locked) {
    return NextResponse.json({ error: 'Prediction is locked — match already scored' }, { status: 403 });
  }

  // Guard: check the match status (live/finished = locked)
  const { data: match } = await supabase
    .from('matches')
    .select('id, status')
    .eq('id', matchId)
    .maybeSingle();

  if (match && (match.status === 'live' || match.status === 'finished')) {
    return NextResponse.json({ error: 'Match already started' }, { status: 403 });
  }

  // Upsert the prediction
  const { error } = await supabase
    .from('match_bonus_predictions')
    .upsert(
      {
        user_id: user.id,
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
      },
      { onConflict: 'user_id,match_id' },
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
