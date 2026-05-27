'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Lock, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearDownstreamOnPickChange } from '@/lib/bracketIntegrity';
import { GroupOrderTab } from './GroupOrderTab';
import { BracketTab } from './BracketTab';
import type { GroupOrders } from '@/lib/groupPrediction';
import type { OfficialKnockoutMatch } from '@/lib/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  userId:              string;
  groupsLocked:        boolean;
  initialGroupOrders:  GroupOrders;
  // Bracket
  bracketStatus:       'not_open' | 'open' | 'locked';
  bracketOpenAt:       string | null;
  bracketLockAt:       string | null;
  knockoutMatches:     OfficialKnockoutMatch[];
  initialBracketPreds: Record<string, string | null>;
}

type Tab = 'grupos' | 'bracket';

const TAB_LABELS: Record<Tab, string> = {
  grupos:  'Grupos',
  bracket: 'Bracket',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function PrediccionClient({
  groupsLocked,
  initialGroupOrders,
  bracketStatus,
  bracketOpenAt,
  bracketLockAt,
  knockoutMatches,
  initialBracketPreds,
}: Props) {
  const [tab,          setTab]         = useState<Tab>('grupos');
  const [groupOrders,  setGroupOrders] = useState<GroupOrders>(initialGroupOrders);
  const [bracketPreds, setBracketPreds] = useState(initialBracketPreds);
  const [saving,       setSaving]      = useState(false);
  const [dirty,        setDirty]       = useState(false);

  const bracketLocked = bracketStatus === 'locked';

  // ── Group handler ──────────────────────────────────────────────────────────

  const handleGroupChange = useCallback((groupId: string, ranking: (string | null)[]) => {
    setGroupOrders(prev => ({ ...prev, [groupId]: ranking }));
    setDirty(true);
  }, []);

  const handleResetGroups = () => {
    if (!confirm('¿Borrar todas las predicciones de grupo?')) return;
    setGroupOrders({});
    setDirty(true);
    toast.info('Grupos reiniciados. Guarda para confirmar.');
  };

  // ── Bracket handler ────────────────────────────────────────────────────────

  const handleBracketPick = useCallback((matchId: string, teamId: string | null) => {
    setBracketPreds(prev => {
      const cleared = clearDownstreamOnPickChange(matchId, teamId, prev);
      return { ...cleared, [matchId]: teamId };
    });
    setDirty(true);
  }, []);

  const handleResetBracket = () => {
    if (!confirm('¿Borrar todas las predicciones del bracket?')) return;
    setBracketPreds({});
    setDirty(true);
    toast.info('Bracket reiniciado. Guarda para confirmar.');
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (groupsLocked && bracketLocked) return;
    setSaving(true);

    try {
      const groupOrdersPayload = Object.entries(groupOrders).map(([groupId, order]) => ({
        groupId,
        teamOrder: order.filter(Boolean) as string[],
      }));

      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupOrders:  groupOrdersPayload,
          bracketPreds,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { error?: string }).error ?? 'Error al guardar');
      } else {
        toast.success('Predicciones guardadas ✓');
        setDirty(false);
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const everythingLocked = groupsLocked && bracketLocked;

  return (
    <div className="min-h-screen pb-safe">
      {/* Sticky header with tabs + save */}
      <div className="sticky top-14 md:top-16 z-30 bg-zinc-50/95 backdrop-blur-sm border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-12">
            {/* Tabs */}
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

            {/* Save area */}
            <div className="flex items-center gap-2">
              {everythingLocked ? (
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
            locked={groupsLocked}
            onReset={groupsLocked ? undefined : handleResetGroups}
          />
        )}

        {tab === 'bracket' && (
          <BracketTab
            bracketStatus={bracketStatus}
            openAt={bracketOpenAt}
            lockAt={bracketLockAt}
            matches={knockoutMatches}
            bracketPreds={bracketPreds}
            onPick={handleBracketPick}
            onResetBracket={bracketLocked ? undefined : handleResetBracket}
          />
        )}
      </div>
    </div>
  );
}
