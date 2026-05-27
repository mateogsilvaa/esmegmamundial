import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isPredictionLocked } from '@/lib/utils';

// ── GET /api/predictions ──────────────────────────────────────────────────────

export async function GET(_req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [{ data: groupOrderRows }, { data: bracketRows }] = await Promise.all([
    supabase.from('group_order_predictions').select('*').eq('user_id', user.id),
    supabase.from('bracket_predictions').select('*').eq('user_id', user.id),
  ]);

  return NextResponse.json({ groupOrderRows, bracketRows });
}

// ── POST /api/predictions ─────────────────────────────────────────────────────
//
// Body: {
//   groupOrders?:  Array<{ groupId: string; teamOrder: string[] }>
//   bracketPreds?: Record<slot, teamId | null>
// }
//
// Group saving is gated by isPredictionLocked() (group_predictions_lock_at).
// Bracket saving is gated by bracket window from app_settings.

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { groupOrders, bracketPreds } = body;

  // ── Save group predictions ─────────────────────────────────────────────────

  if (groupOrders && Array.isArray(groupOrders) && groupOrders.length > 0) {
    if (isPredictionLocked()) {
      return NextResponse.json(
        { error: 'Las predicciones de grupo están bloqueadas' },
        { status: 403 },
      );
    }

    const rows = groupOrders
      .filter((g: { groupId: string; teamOrder: string[] }) =>
        g.groupId && Array.isArray(g.teamOrder) && g.teamOrder.length > 0,
      )
      .map((g: { groupId: string; teamOrder: string[] }) => ({
        user_id:    user.id,
        group_id:   g.groupId,
        team_order: g.teamOrder.slice(0, 4),
      }));

    if (rows.length > 0) {
      const { error } = await supabase
        .from('group_order_predictions')
        .upsert(rows, { onConflict: 'user_id,group_id' });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // ── Save bracket predictions ───────────────────────────────────────────────

  if (bracketPreds && typeof bracketPreds === 'object') {
    // Check bracket window from app_settings
    const { data: settingsRows } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['bracket_predictions_open_at', 'bracket_predictions_lock_at']);

    const settings = Object.fromEntries(
      (settingsRows ?? []).map((r: { key: string; value: string }) => [r.key, r.value]),
    );
    const openAt = settings['bracket_predictions_open_at'];
    const lockAt = settings['bracket_predictions_lock_at'];
    const now    = new Date();

    if (!openAt || now < new Date(openAt)) {
      return NextResponse.json(
        { error: 'El bracket aún no está disponible para predicciones' },
        { status: 403 },
      );
    }
    if (lockAt && now >= new Date(lockAt)) {
      return NextResponse.json(
        { error: 'Las predicciones de bracket están cerradas' },
        { status: 403 },
      );
    }

    const bracketRows = Object.entries(bracketPreds)
      .filter(([slot]) => slot.startsWith('P'))
      .map(([slot, teamId]) => ({
        user_id: user.id,
        slot,
        team_id: (teamId as string | null) ?? null,
      }));

    if (bracketRows.length > 0) {
      const { error } = await supabase
        .from('bracket_predictions')
        .upsert(bracketRows, { onConflict: 'user_id,slot' });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
