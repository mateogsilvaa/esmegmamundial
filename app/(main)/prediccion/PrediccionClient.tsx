'use client';

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Lock, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildQualifiedSlots, type GroupOrders, type ThirdsRanking } from '@/lib/groupPrediction';
import { validateAndCleanBracket, clearDownstreamOnPickChange } from '@/lib/bracketIntegrity';
import { GroupOrderTab } from './GroupOrderTab';
import { ThirdsTab } from './ThirdsTab';
import { BracketTab } from './BracketTab';

interface Props {
  userId: string;
  locked: boolean;
  initialGroupOrders:  GroupOrders;
  initialThirdsRanking: ThirdsRanking;
  initialBracketPreds: Record<string, string | null>;
}

type Tab = 'grupos' | 'terceros' | 'bracket';

const TAB_LABELS: Record<Tab, string> = {
  grupos:   'Grupos',
  terceros: 'Terceros',
  bracket:  'Bracket',
};

export function PrediccionClient({
  userId,
  locked,
  initialGroupOrders,
  initialThirdsRanking,
  initialBracketPreds,
}: Props) {
  const [tab,           setTab]          = useState<Tab>('grupos');
  const [groupOrders,   setGroupOrders]  = useState<GroupOrders>(initialGroupOrders);
  const [thirdsRanking, setThirdsRanking] = useState<ThirdsRanking>(initialThirdsRanking);
  const [bracketPreds,  setBracketPreds] = useState(initialBracketPreds);
  const [saving,        setSaving]       = useState(false);
  const [dirty,         setDirty]        = useState(false);

  // Derived: qualified slots + thirdGroups from user's group/thirds predictions
  const { slots: qualifiedSlots, thirdGroups } = useMemo(
    () => buildQualifiedSlots(groupOrders, thirdsRanking),
    [groupOrders, thirdsRanking],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleGroupChange = useCallback((groupId: string, ranking: (string | null)[]) => {
    setGroupOrders(prev => {
      const updated = { ...prev, [groupId]: ranking };
      // Recompute slots and clean bracket if qualified teams changed
      const { slots: newSlots, thirdGroups: newThirdGroups } = buildQualifiedSlots(updated, thirdsRanking);
      setBracketPreds(b => validateAndCleanBracket(b, newSlots, newThirdGroups));
      return updated;
    });
    setDirty(true);
  }, [thirdsRanking]);

  const handleThirdsChange = useCallback((ranking: ThirdsRanking) => {
    setThirdsRanking(ranking);
    // Recompute with new thirds ranking
    const { slots: newSlots, thirdGroups: newThirdGroups } = buildQualifiedSlots(groupOrders, ranking);
    setBracketPreds(b => validateAndCleanBracket(b, newSlots, newThirdGroups));
    setDirty(true);
  }, [groupOrders]);

  const handleBracketPick = useCallback((slot: string, teamId: string | null) => {
    setBracketPreds(prev => {
      const cleared = clearDownstreamOnPickChange(slot, teamId, prev);
      return { ...cleared, [slot]: teamId };
    });
    setDirty(true);
  }, []);

  const handleResetGroups = () => {
    if (!confirm('¿Borrar todas las predicciones de grupo? El bracket también se limpiará.')) return;
    setGroupOrders({});
    setThirdsRanking([]);
    setBracketPreds({});
    setDirty(true);
    toast.info('Predicciones borradas. Guarda para confirmar.');
  };

  const handleResetBracket = () => {
    if (!confirm('¿Borrar todas las predicciones del bracket?')) return;
    setBracketPreds({});
    setDirty(true);
    toast.info('Bracket borrado. Guarda para confirmar.');
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (locked) return;
    setSaving(true);

    try {
      // Serialise groupOrders → array of { groupId, teamOrder }
      const groupOrdersPayload = Object.entries(groupOrders).map(([groupId, order]) => ({
        groupId,
        teamOrder: order.filter(Boolean) as string[],
      }));

      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupOrders:    groupOrdersPayload,
          thirdsRanking,
          bracketPreds,
        }),
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pb-safe">
      {/* Sticky header with tabs */}
      <div className="sticky top-14 md:top-16 z-30 bg-zinc-50/95 backdrop-blur-sm border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-1">
              {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    tab === t
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
                  )}
                >
                  {TAB_LABELS[t]}
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
                    <span className="text-xs text-amber-600 font-medium hidden sm:block">
                      Sin guardar
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving || !dirty}
                    className="btn-primary py-1.5 text-xs"
                  >
                    {saving
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Save size={13} />
                    }
                    {saving ? 'Guardando' : 'Guardar'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {tab === 'grupos' && (
          <GroupOrderTab
            groupOrders={groupOrders}
            onChange={handleGroupChange}
            locked={locked}
            onReset={locked ? undefined : handleResetGroups}
          />
        )}

        {tab === 'terceros' && (
          <ThirdsTab
            groupOrders={groupOrders}
            thirdsRanking={thirdsRanking}
            onChange={handleThirdsChange}
            locked={locked}
          />
        )}

        {tab === 'bracket' && (
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
