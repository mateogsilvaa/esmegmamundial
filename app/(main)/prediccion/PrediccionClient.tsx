'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Lock, Save, Loader2 } from 'lucide-react';
import { computeQualifiedSlotsWithGroups } from '@/lib/utils';
import { validateAndCleanBracket, clearDownstreamOnPickChange } from '@/lib/bracketIntegrity';
import { GroupsTab } from './GroupsTab';
import { BracketTab } from './BracketTab';
import { cn } from '@/lib/utils';

interface Props {
  userId: string;
  locked: boolean;
  initialMatchPreds: Record<string, { homeScore: number; awayScore: number }>;
  initialBracketPreds: Record<string, string | null>;
}

type Tab = 'grupos' | 'bracket';

export function PrediccionClient({ userId, locked, initialMatchPreds, initialBracketPreds }: Props) {
  const [tab, setTab] = useState<Tab>('grupos');
  const [matchPreds, setMatchPreds] = useState(initialMatchPreds);
  const [bracketPreds, setBracketPreds] = useState(initialBracketPreds);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const { slots: qualifiedSlots, thirdGroups } = computeQualifiedSlotsWithGroups(matchPreds);

  const handleScoreChange = useCallback((matchId: string, homeScore: number, awayScore: number) => {
    setMatchPreds(prev => {
      const updated = { ...prev, [matchId]: { homeScore, awayScore } };
      // Recompute qualified slots from the updated match preds and clean bracket accordingly
      const { slots: newSlots, thirdGroups: newThirdGroups } = computeQualifiedSlotsWithGroups(updated);
      setBracketPreds(b => validateAndCleanBracket(b, newSlots, newThirdGroups));
      return updated;
    });
    setDirty(true);
  }, []);

  const handleBracketPick = useCallback((slot: string, teamId: string | null) => {
    setBracketPreds(prev => {
      const cleared = clearDownstreamOnPickChange(slot, teamId, prev);
      return { ...cleared, [slot]: teamId };
    });
    setDirty(true);
  }, []);

  const handleSave = async () => {
    if (locked) return;
    setSaving(true);

    try {
      // Save match predictions
      const matchEntries = Object.entries(matchPreds).map(([matchId, { homeScore, awayScore }]) => ({
        user_id: userId,
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
      }));

      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchPredictions: matchEntries, bracketPredictions: bracketPreds }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? 'Error al guardar');
      } else {
        toast.success('Predicciones guardadas ✓');
        setDirty(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResetGroups = async () => {
    if (!confirm('¿Borrar todas las predicciones de grupo? Esta acción no se puede deshacer.')) return;
    setMatchPreds({});
    setDirty(true);
    toast.info('Predicciones de grupos borradas. Guarda para confirmar.');
  };

  const handleResetBracket = async () => {
    if (!confirm('¿Borrar todas las predicciones del bracket?')) return;
    setBracketPreds({});
    setDirty(true);
    toast.info('Bracket borrado. Guarda para confirmar.');
  };

  return (
    <div className="min-h-screen pb-safe">
      {/* Sticky header */}
      <div className="sticky top-14 md:top-16 z-30 bg-zinc-50/95 backdrop-blur-sm border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-1">
              {(['grupos', 'bracket'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                    tab === t
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
                  )}
                >
                  {t === 'grupos' ? 'Grupos' : 'Bracket'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {locked ? (
                <span className="badge-locked">
                  <Lock size={11} />
                  Bloqueado
                </span>
              ) : (
                <>
                  {dirty && (
                    <span className="text-xs text-amber-600 font-medium hidden sm:block">Sin guardar</span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving || !dirty}
                    className="btn-primary py-1.5 text-xs"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    {saving ? 'Guardando' : 'Guardar'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {tab === 'grupos' ? (
          <GroupsTab
            matchPreds={matchPreds}
            qualifiedSlots={qualifiedSlots}
            onScoreChange={handleScoreChange}
            locked={locked}
            onResetGroups={locked ? undefined : handleResetGroups}
          />
        ) : (
          <BracketTab
            qualifiedSlots={qualifiedSlots}
            thirdGroups={thirdGroups}
            bracketPreds={bracketPreds}
            onPick={handleBracketPick}
            locked={locked}
            onResetBracket={locked ? undefined : handleResetBracket}
          />
        )}
      </div>
    </div>
  );
}
