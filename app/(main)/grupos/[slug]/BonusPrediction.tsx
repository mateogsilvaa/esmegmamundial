'use client';

import { useState } from 'react';
import { Star, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  matchId:       string;
  initialHome:   number | null;
  initialAway:   number | null;
  dbLocked:      boolean;          // locked=true in DB (scoring already happened)
  pointsEarned:  number | null;
  matchStatus:   'scheduled' | 'live' | 'finished' | 'postponed';
}

/**
 * Bonus score prediction widget for a single match.
 *
 * - Editable only when match is scheduled (not live/finished) and not locked.
 * - Saves to POST /api/bonus.
 * - Shows points earned once match is finished.
 */
export function BonusPrediction({
  matchId, initialHome, initialAway, dbLocked, pointsEarned, matchStatus,
}: Props) {
  const [home, setHome] = useState(initialHome !== null ? String(initialHome) : '');
  const [away, setAway] = useState(initialAway !== null ? String(initialAway) : '');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  const matchStarted = matchStatus === 'live' || matchStatus === 'finished';
  const isLocked     = dbLocked || matchStarted;
  const hasPred      = initialHome !== null && initialAway !== null;

  // If locked and no prediction exists, nothing to show
  if (isLocked && !hasPred) return null;

  async function handleSave() {
    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0 || h > 20 || a > 20) {
      setErr('Score inválido (0–20)');
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch('/api/bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, homeScore: h, awayScore: a }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr((d as { error?: string }).error ?? 'Error al guardar');
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setErr('Error de red');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center gap-3 flex-wrap">
      {/* Label */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Star size={11} className="text-amber-500 fill-amber-500" />
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Bonus</span>
      </div>

      {isLocked ? (
        /* ── Read-only state ── */
        <div className="flex items-center gap-2 flex-wrap">
          <Lock size={11} className="text-zinc-400" />
          <span className="text-xs text-zinc-500">Tu predicción:</span>
          <span className="tabular text-xs font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
            {initialHome} – {initialAway}
          </span>
          {matchStatus === 'finished' && pointsEarned !== null && (
            <span className={cn(
              'text-[11px] font-bold px-2 py-0.5 rounded-full',
              pointsEarned > 0
                ? 'bg-green-100 text-green-700'
                : 'bg-zinc-100 text-zinc-500',
            )}>
              {pointsEarned > 0 ? `+${pointsEarned} pts` : '0 pts'}
            </span>
          )}
        </div>
      ) : (
        /* ── Editable state ── */
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500">Score exacto:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={20}
              value={home}
              onChange={e => { setHome(e.target.value); setSaved(false); }}
              placeholder="–"
              className={cn(
                'w-10 text-center tabular text-sm font-bold',
                'border border-zinc-200 rounded-md px-1 py-0.5',
                'focus:outline-none focus:ring-1 focus:ring-zinc-400',
                '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              )}
            />
            <span className="text-zinc-400 font-light">–</span>
            <input
              type="number"
              min={0}
              max={20}
              value={away}
              onChange={e => { setAway(e.target.value); setSaved(false); }}
              placeholder="–"
              className={cn(
                'w-10 text-center tabular text-sm font-bold',
                'border border-zinc-200 rounded-md px-1 py-0.5',
                'focus:outline-none focus:ring-1 focus:ring-zinc-400',
                '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              )}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || home === '' || away === ''}
            className={cn(
              'text-xs font-semibold px-3 py-0.5 rounded-md transition-all',
              saved
                ? 'bg-green-100 text-green-700'
                : 'bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-default',
            )}
          >
            {saving ? '...' : saved ? '✓ Guardado' : 'Guardar'}
          </button>
          {err && <span className="text-xs text-red-600">{err}</span>}
        </div>
      )}
    </div>
  );
}
