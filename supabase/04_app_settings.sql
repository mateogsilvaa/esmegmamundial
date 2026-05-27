-- ============================================================
--  MUNDIAL 2026 — Migration 04: App settings + scoring simplification
--  Elimina terceros, simplifica leaderboard, añade ventana bracket configurable.
--  Ejecutar en: Supabase > SQL Editor (idempotente)
-- ============================================================

-- ─── 1. Tabla app_settings ────────────────────────────────────────────────────
--  Clave-valor para configuración operativa del torneo.
--  Administrada directamente en el SQL editor o desde panel admin.

create table if not exists public.app_settings (
  key         text primary key,
  value       text not null,
  description text
);

alter table public.app_settings enable row level security;

drop policy if exists "App settings publicly readable" on public.app_settings;
create policy "App settings publicly readable"
  on public.app_settings for select using (true);

-- Valores por defecto (no sobreescribe si ya existen)
insert into public.app_settings (key, value, description) values
  ('group_predictions_lock_at',
   '2026-06-11T19:00:00Z',
   'Cierre de predicciones de grupo — primer partido (México vs Sudáfrica)'),
  ('bracket_predictions_open_at',
   '2026-07-01T12:00:00Z',
   'Apertura del bracket — cuando se publique el cuadro oficial de R32'),
  ('bracket_predictions_lock_at',
   '2026-07-04T17:00:00Z',
   'Cierre del bracket — justo antes del primer partido de octavos (P90)')
on conflict (key) do nothing;

-- ─── 2. Simplificar leaderboard ──────────────────────────────────────────────
--  Eliminar columnas del sistema de terceros y desglose viejo.
--  Añadir group_pts y bracket_pts como columnas consolidadas.

alter table public.leaderboard
  add column if not exists group_pts   int not null default 0,
  add column if not exists bracket_pts int not null default 0;

-- Eliminar columnas del sistema antiguo (si existen)
alter table public.leaderboard
  drop column if exists group_qualifier,
  drop column if exists group_position,
  drop column if exists thirds_selected,
  drop column if exists thirds_order,
  drop column if exists knockout_pts;

-- ─── 3. Actualizar RLS de bracket_predictions ────────────────────────────────
--  La fecha de cierre del bracket ahora viene de app_settings (no hardcodeada).
--  El control de la ventana se hace en la capa de API.

drop policy if exists "Users insert own bracket preds before lock" on public.bracket_predictions;
drop policy if exists "Users update own bracket preds before lock" on public.bracket_predictions;
drop policy if exists "Users delete own bracket preds before lock" on public.bracket_predictions;
drop policy if exists "Users manage own bracket preds"            on public.bracket_predictions;

create policy "Users manage own bracket preds"
  on public.bracket_predictions for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── 4. Eliminar third_place_predictions ─────────────────────────────────────
--  Ya no se usan en el nuevo sistema de predicción.

drop table if exists public.third_place_predictions cascade;

-- ─── 5. Recargar schema cache de PostgREST ────────────────────────────────────

notify pgrst, 'reload schema';
