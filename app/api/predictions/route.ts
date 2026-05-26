import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isPredictionLocked } from '@/lib/utils';

export async function GET(_req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [{ data: matchPreds }, { data: bracketPreds }] = await Promise.all([
    supabase.from('predictions').select('*').eq('user_id', user.id),
    supabase.from('bracket_predictions').select('*').eq('user_id', user.id),
  ]);

  return NextResponse.json({ matchPreds, bracketPreds });
}

export async function POST(req: NextRequest) {
  if (isPredictionLocked()) {
    return NextResponse.json({ error: 'Las predicciones están bloqueadas' }, { status: 403 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { matchPredictions, bracketPredictions } = body;

  // Upsert match predictions
  if (matchPredictions && Array.isArray(matchPredictions)) {
    const rows = matchPredictions.map((p: {
      match_id: string; home_score: number; away_score: number;
    }) => ({
      user_id: user.id,
      match_id: p.match_id,
      home_score: Math.max(0, Math.min(20, Math.round(p.home_score))),
      away_score: Math.max(0, Math.min(20, Math.round(p.away_score))),
    }));

    if (rows.length > 0) {
      const { error } = await supabase
        .from('predictions')
        .upsert(rows, { onConflict: 'user_id,match_id' });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Upsert bracket predictions
  if (bracketPredictions && typeof bracketPredictions === 'object') {
    const rows = Object.entries(bracketPredictions)
      .filter(([, teamId]) => teamId !== undefined)
      .map(([slot, teamId]) => ({
        user_id: user.id,
        slot,
        team_id: teamId as string | null,
      }));

    if (rows.length > 0) {
      const { error } = await supabase
        .from('bracket_predictions')
        .upsert(rows, { onConflict: 'user_id,slot' });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
