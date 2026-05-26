import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// Admin-only endpoint. Requires Bearer token = SUPABASE_SERVICE_ROLE_KEY.
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const {
    matchId, homeScore, awayScore,
    homeScoreExtra, awayScoreExtra,
    homePenalties, awayPenalties,
    winnerId, status,
  } = body;

  if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 });

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('matches')
    .update({
      home_score: homeScore ?? null,
      away_score: awayScore ?? null,
      home_score_extra: homeScoreExtra ?? null,
      away_score_extra: awayScoreExtra ?? null,
      home_penalties: homePenalties ?? null,
      away_penalties: awayPenalties ?? null,
      winner_id: winnerId ?? null,
      status: status ?? 'finished',
    })
    .eq('id', matchId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
