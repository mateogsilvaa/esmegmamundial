import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { scoreMatchBonus } from '@/lib/scoring';

/**
 * Admin endpoint: recalcular puntos de bonus tras el fin de un partido.
 *
 * POST /api/scores/recalculate  { matchId: 'A1' }
 * Header: Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 *
 * Flujo:
 *  1. Puntúa match_bonus_predictions para ese partido.
 *  2. Marca cada predicción como locked=true y guarda points_earned.
 *  3. Recalcula leaderboard.bonus_score + total_points para los usuarios afectados.
 *  4. Recalcula ranks globales.
 */
export async function POST(req: NextRequest) {
  // Guard: solo service role
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { matchId } = await req.json();
  if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 });

  const supabase = createServiceClient();

  // ── 1. Resultado oficial ──────────────────────────────────────────────────

  const { data: match } = await supabase
    .from('matches')
    .select('id, home_score, away_score, status')
    .eq('id', matchId)
    .single();

  if (!match || match.status !== 'finished') {
    return NextResponse.json({ error: 'Match not finished' }, { status: 400 });
  }

  // ── 2. Puntuar bonus predictions ──────────────────────────────────────────

  const { data: bonusPreds } = await supabase
    .from('match_bonus_predictions')
    .select('id, user_id, home_score, away_score')
    .eq('match_id', matchId)
    .eq('locked', false);   // solo las no bloqueadas (evitar doble scoring)

  const bonusUpdates: { id: string; user_id: string; pts: number }[] = [];

  for (const pred of bonusPreds ?? []) {
    const { pts } = scoreMatchBonus(
      matchId,
      pred.home_score,
      pred.away_score,
      match.home_score,
      match.away_score,
    );
    bonusUpdates.push({ id: pred.id, user_id: pred.user_id, pts });
  }

  // Guardar points_earned + locked en cada predicción bonus
  for (const u of bonusUpdates) {
    await supabase
      .from('match_bonus_predictions')
      .update({ points_earned: u.pts, locked: true })
      .eq('id', u.id);
  }

  // ── 3. Recalcular leaderboard para los usuarios afectados ─────────────────

  const affectedUserIds = Array.from(new Set(bonusUpdates.map(u => u.user_id)));

  for (const userId of affectedUserIds) {
    // Sumar todos los puntos bonus del usuario (incluyendo partidos anteriores)
    const { data: allBonus } = await supabase
      .from('match_bonus_predictions')
      .select('points_earned')
      .eq('user_id', userId);

    const bonusScore = allBonus?.reduce((s, p) => s + (p.points_earned ?? 0), 0) ?? 0;

    // Recuperar otros puntos del leaderboard para preservarlos
    const { data: current } = await supabase
      .from('leaderboard')
      .select('group_pts, bracket_pts')
      .eq('user_id', userId)
      .maybeSingle();

    const groupPts   = current?.group_pts   ?? 0;
    const bracketPts = current?.bracket_pts ?? 0;
    const total      = groupPts + bracketPts + bonusScore;

    await supabase
      .from('leaderboard')
      .upsert(
        {
          user_id:      userId,
          bonus_score:  bonusScore,
          total_points: total,
          last_updated: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );
  }

  // ── 4. Recalcular ranks globales ──────────────────────────────────────────

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

  return NextResponse.json({
    success:      true,
    bonusUpdated: bonusUpdates.length,
    matchId,
  });
}
