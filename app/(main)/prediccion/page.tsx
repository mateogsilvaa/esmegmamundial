import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isPredictionLocked } from '@/lib/utils';
import { PrediccionClient } from './PrediccionClient';
import { GROUP_MATCHES } from '@/lib/data/matches';

export default async function PrediccionPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const locked = isPredictionLocked();

  // Fetch existing predictions
  const [{ data: matchPreds }, { data: bracketPreds }] = await Promise.all([
    supabase
      .from('predictions')
      .select('match_id, home_score, away_score, winner_id')
      .eq('user_id', user.id),
    supabase
      .from('bracket_predictions')
      .select('slot, team_id')
      .eq('user_id', user.id),
  ]);

  const initialMatchPreds: Record<string, { homeScore: number; awayScore: number }> = {};
  for (const p of matchPreds ?? []) {
    initialMatchPreds[p.match_id] = { homeScore: p.home_score, awayScore: p.away_score };
  }

  const initialBracketPreds: Record<string, string | null> = {};
  for (const p of bracketPreds ?? []) {
    initialBracketPreds[p.slot] = p.team_id;
  }

  return (
    <PrediccionClient
      userId={user.id}
      locked={locked}
      initialMatchPreds={initialMatchPreds}
      initialBracketPreds={initialBracketPreds}
    />
  );
}
