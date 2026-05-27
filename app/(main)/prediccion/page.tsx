import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isPredictionLocked } from '@/lib/utils';
import { PrediccionClient } from './PrediccionClient';
import { GROUP_IDS } from '@/lib/data/teams';
import type { GroupOrders, ThirdsRanking } from '@/lib/groupPrediction';

export default async function PrediccionPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const locked = isPredictionLocked();

  // Fetch existing predictions from new tables
  const [{ data: groupOrderRows }, { data: thirdsRow }, { data: bracketRows }] =
    await Promise.all([
      supabase
        .from('group_order_predictions')
        .select('group_id, team_order')
        .eq('user_id', user.id),
      supabase
        .from('third_place_predictions')
        .select('ranking')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('bracket_predictions')
        .select('slot, team_id')
        .eq('user_id', user.id),
    ]);

  // Build GroupOrders: always 4 slots per group
  const initialGroupOrders: GroupOrders = {};
  for (const gId of GROUP_IDS) {
    initialGroupOrders[gId] = [null, null, null, null];
  }
  for (const row of groupOrderRows ?? []) {
    const order = (row.team_order as string[]) ?? [];
    // Pad to 4 slots
    initialGroupOrders[row.group_id] = [
      order[0] ?? null,
      order[1] ?? null,
      order[2] ?? null,
      order[3] ?? null,
    ];
  }

  // Build ThirdsRanking
  const initialThirdsRanking: ThirdsRanking = (thirdsRow?.ranking as string[]) ?? [];

  // Build bracket predictions
  const initialBracketPreds: Record<string, string | null> = {};
  for (const p of bracketRows ?? []) {
    initialBracketPreds[p.slot] = p.team_id ?? null;
  }

  return (
    <PrediccionClient
      userId={user.id}
      locked={locked}
      initialGroupOrders={initialGroupOrders}
      initialThirdsRanking={initialThirdsRanking}
      initialBracketPreds={initialBracketPreds}
    />
  );
}
