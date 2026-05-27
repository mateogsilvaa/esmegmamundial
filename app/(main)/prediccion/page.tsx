import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isPredictionLocked } from '@/lib/utils';
import { PrediccionClient } from './PrediccionClient';
import { GROUP_IDS } from '@/lib/data/teams';
import type { GroupOrders } from '@/lib/groupPrediction';
import type { OfficialKnockoutMatch, Phase } from '@/lib/types';

export default async function PrediccionPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const groupsLocked = isPredictionLocked();

  // ── App settings: bracket window ──────────────────────────────────────────
  const { data: settingsRows } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['bracket_predictions_open_at', 'bracket_predictions_lock_at']);

  const settings = Object.fromEntries(
    (settingsRows ?? []).map(r => [r.key, r.value]),
  );

  const bracketOpenAt = settings['bracket_predictions_open_at'] ?? null;
  const bracketLockAt = settings['bracket_predictions_lock_at'] ?? null;

  const now = new Date();
  let bracketStatus: 'not_open' | 'open' | 'locked' = 'not_open';
  if (bracketOpenAt && now >= new Date(bracketOpenAt)) {
    bracketStatus = bracketLockAt && now >= new Date(bracketLockAt) ? 'locked' : 'open';
  }

  // ── Fetch official knockout matches (for bracket UI) ───────────────────────
  // Only needed once the bracket is open or locked (already visible to user)
  let knockoutMatches: OfficialKnockoutMatch[] = [];
  if (bracketStatus !== 'not_open') {
    const { data: dbMatches } = await supabase
      .from('matches')
      .select('id, phase, home_team_id, away_team_id, winner_id, scheduled_at')
      .neq('phase', 'group')
      .order('id');

    knockoutMatches = (dbMatches ?? []).map(m => ({
      id:          m.id,
      round:       m.phase as Phase,
      homeTeamId:  m.home_team_id   ?? null,
      awayTeamId:  m.away_team_id   ?? null,
      winnerId:    m.winner_id      ?? null,
      scheduledAt: m.scheduled_at,
    }));
  }

  // ── Fetch existing user predictions ───────────────────────────────────────
  const [{ data: groupOrderRows }, { data: bracketRows }] = await Promise.all([
    supabase
      .from('group_order_predictions')
      .select('group_id, team_order')
      .eq('user_id', user.id),
    supabase
      .from('bracket_predictions')
      .select('slot, team_id')
      .eq('user_id', user.id),
  ]);

  // Build GroupOrders (all 12 groups, padded to 4 slots)
  const initialGroupOrders: GroupOrders = {};
  for (const gId of GROUP_IDS) {
    initialGroupOrders[gId] = [null, null, null, null];
  }
  for (const row of groupOrderRows ?? []) {
    const order = (row.team_order as string[]) ?? [];
    initialGroupOrders[row.group_id] = [
      order[0] ?? null,
      order[1] ?? null,
      order[2] ?? null,
      order[3] ?? null,
    ];
  }

  // Build bracket predictions
  const initialBracketPreds: Record<string, string | null> = {};
  for (const p of bracketRows ?? []) {
    initialBracketPreds[p.slot] = p.team_id ?? null;
  }

  return (
    <PrediccionClient
      userId={user.id}
      groupsLocked={groupsLocked}
      initialGroupOrders={initialGroupOrders}
      bracketStatus={bracketStatus}
      bracketOpenAt={bracketOpenAt}
      bracketLockAt={bracketLockAt}
      knockoutMatches={knockoutMatches}
      initialBracketPreds={initialBracketPreds}
    />
  );
}
