import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isPredictionLocked } from '@/lib/utils';

export async function POST(_req: NextRequest) {
  if (isPredictionLocked()) {
    return NextResponse.json({ error: 'Las predicciones están bloqueadas' }, { status: 403 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [p1, p2, p3] = await Promise.all([
    supabase.from('predictions').delete().eq('user_id', user.id),
    supabase.from('bracket_predictions').delete().eq('user_id', user.id),
    supabase.from('group_predictions').delete().eq('user_id', user.id),
  ]);

  const error = p1.error ?? p2.error ?? p3.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
