import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isPredictionLocked } from '@/lib/utils';

export async function GET(_req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [
    { data: groupOrderRows },
    { data: thirdsRow },
    { data: bracketRows },
  ] = await Promise.all([
    supabase.from('group_order_predictions').select('*').eq('user_id', user.id),
    supabase.from('third_place_predictions').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('bracket_predictions').select('*').eq('user_id', user.id),
  ]);

  return NextResponse.json({ groupOrderRows, thirdsRow, bracketRows });
}

export async function POST(req: NextRequest) {
  if (isPredictionLocked()) {
    return NextResponse.json({ error: 'Las predicciones están bloqueadas' }, { status: 403 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    groupOrders,     // Array<{ groupId: string; teamOrder: string[] }>
    thirdsRanking,   // string[] — exactly 8 teamIds (or partial)
    bracketPreds,    // Record<slot, teamId | null>
  } = body;

  // ── Group order predictions ──────────────────────────────────────────────
  if (groupOrders && Array.isArray(groupOrders)) {
    const rows = groupOrders
      .filter((g: { groupId: string; teamOrder: string[] }) =>
        g.groupId && Array.isArray(g.teamOrder) && g.teamOrder.length > 0,
      )
      .map((g: { groupId: string; teamOrder: string[] }) => ({
        user_id:    user.id,
        group_id:   g.groupId,
        team_order: g.teamOrder.slice(0, 4), // max 4 teams
      }));

    if (rows.length > 0) {
      const { error } = await supabase
        .from('group_order_predictions')
        .upsert(rows, { onConflict: 'user_id,group_id' });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // ── Thirds ranking ───────────────────────────────────────────────────────
  if (thirdsRanking !== undefined) {
    const ranking = Array.isArray(thirdsRanking)
      ? thirdsRanking.filter(Boolean).slice(0, 8)
      : [];

    if (ranking.length > 0) {
      const { error } = await supabase
        .from('third_place_predictions')
        .upsert({ user_id: user.id, ranking }, { onConflict: 'user_id' });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // ── Bracket predictions ──────────────────────────────────────────────────
  if (bracketPreds && typeof bracketPreds === 'object') {
    const rows = Object.entries(bracketPreds)
      .filter(([slot]) => slot.startsWith('P'))
      .map(([slot, teamId]) => ({
        user_id: user.id,
        slot,
        team_id: (teamId as string | null) ?? null,
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
