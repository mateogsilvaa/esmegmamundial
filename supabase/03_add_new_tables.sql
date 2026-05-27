-- ============================================================
--  MUNDIAL 2026 — Migración incremental (sin borrar nada)
--  Ejecutar SOBRE un schema existente para añadir lo que falta.
--  Es idempotente: se puede ejecutar varias veces sin error.
-- ============================================================

-- ─── 1. Columnas nuevas en profiles ──────────────────────────────────────────

alter table public.profiles
  add column if not exists favorite_team_id      text,
  add column if not exists is_predictions_public boolean not null default true;

-- Migrar datos de favorite_team → favorite_team_id si existía la columna antigua
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'profiles'
      and column_name  = 'favorite_team'
  ) then
    update public.profiles
    set favorite_team_id = favorite_team
    where favorite_team_id is null and favorite_team is not null;
  end if;
end;
$$;

-- ─── 2. Columnas nuevas en leaderboard ───────────────────────────────────────

alter table public.leaderboard
  add column if not exists group_qualifier  int not null default 0,
  add column if not exists group_position   int not null default 0,
  add column if not exists thirds_selected  int not null default 0,
  add column if not exists thirds_order     int not null default 0,
  add column if not exists bonus_score      int not null default 0;

-- Eliminar columnas viejas que ya no se usan (si existen)
alter table public.leaderboard
  drop column if exists exact_score_pts,
  drop column if exists correct_result_pts,
  drop column if exists group_position_pts,
  drop column if exists third_qualifier_pts,
  drop column if exists exact_knockout_pts,
  drop column if exists semifinalist_pts,
  drop column if exists finalist_pts,
  drop column if exists champion_pts;

-- ─── 3. Tabla: group_order_predictions ───────────────────────────────────────

create table if not exists public.group_order_predictions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  group_id      text not null,
  team_order    text[] not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, group_id)
);

alter table public.group_order_predictions enable row level security;

drop policy if exists "Group order preds viewable by all"  on public.group_order_predictions;
drop policy if exists "Users insert own group order preds before lock" on public.group_order_predictions;
drop policy if exists "Users update own group order preds before lock" on public.group_order_predictions;
drop policy if exists "Users delete own group order preds before lock" on public.group_order_predictions;

create policy "Group order preds viewable by all"
  on public.group_order_predictions for select using (true);

create policy "Users insert own group order preds before lock"
  on public.group_order_predictions for insert with check (
    auth.uid() = user_id
    and now() < '2026-06-11 19:00:00+00'::timestamptz
  );

create policy "Users update own group order preds before lock"
  on public.group_order_predictions for update using (
    auth.uid() = user_id
    and now() < '2026-06-11 19:00:00+00'::timestamptz
  );

create policy "Users delete own group order preds before lock"
  on public.group_order_predictions for delete using (
    auth.uid() = user_id
    and now() < '2026-06-11 19:00:00+00'::timestamptz
  );

create trigger if not exists set_group_order_preds_updated_at
  before update on public.group_order_predictions
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_grp_order_preds_user on public.group_order_predictions(user_id);

-- ─── 4. Tabla: third_place_predictions ───────────────────────────────────────

create table if not exists public.third_place_predictions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  ranking       text[] not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id)
);

alter table public.third_place_predictions enable row level security;

drop policy if exists "Third place preds viewable by all" on public.third_place_predictions;
drop policy if exists "Users insert own thirds preds before lock" on public.third_place_predictions;
drop policy if exists "Users update own thirds preds before lock" on public.third_place_predictions;
drop policy if exists "Users delete own thirds preds before lock" on public.third_place_predictions;

create policy "Third place preds viewable by all"
  on public.third_place_predictions for select using (true);

create policy "Users insert own thirds preds before lock"
  on public.third_place_predictions for insert with check (
    auth.uid() = user_id
    and now() < '2026-06-11 19:00:00+00'::timestamptz
  );

create policy "Users update own thirds preds before lock"
  on public.third_place_predictions for update using (
    auth.uid() = user_id
    and now() < '2026-06-11 19:00:00+00'::timestamptz
  );

create policy "Users delete own thirds preds before lock"
  on public.third_place_predictions for delete using (
    auth.uid() = user_id
    and now() < '2026-06-11 19:00:00+00'::timestamptz
  );

create trigger if not exists set_third_preds_updated_at
  before update on public.third_place_predictions
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_third_preds_user on public.third_place_predictions(user_id);

-- ─── 5. Tabla: match_bonus_predictions ───────────────────────────────────────

create table if not exists public.match_bonus_predictions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  match_id      text not null references public.matches(id) on delete cascade,
  home_score    int not null check (home_score >= 0 and home_score <= 20),
  away_score    int not null check (away_score >= 0 and away_score <= 20),
  points_earned int not null default 0,
  locked        boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, match_id)
);

alter table public.match_bonus_predictions enable row level security;

drop policy if exists "Bonus preds viewable (public profiles)" on public.match_bonus_predictions;
drop policy if exists "Users insert own bonus preds" on public.match_bonus_predictions;
drop policy if exists "Users update own bonus preds" on public.match_bonus_predictions;
drop policy if exists "Users delete own bonus preds" on public.match_bonus_predictions;

create policy "Bonus preds viewable (public profiles)"
  on public.match_bonus_predictions for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = match_bonus_predictions.user_id
        and p.is_predictions_public = true
    )
  );

create policy "Users insert own bonus preds"
  on public.match_bonus_predictions for insert with check (
    auth.uid() = user_id
    and locked = false
  );

create policy "Users update own bonus preds"
  on public.match_bonus_predictions for update using (
    auth.uid() = user_id
    and locked = false
  );

create policy "Users delete own bonus preds"
  on public.match_bonus_predictions for delete using (
    auth.uid() = user_id
    and locked = false
  );

create trigger if not exists set_bonus_preds_updated_at
  before update on public.match_bonus_predictions
  for each row execute procedure public.handle_updated_at();

create index if not exists idx_bonus_preds_user  on public.match_bonus_predictions(user_id);
create index if not exists idx_bonus_preds_match on public.match_bonus_predictions(match_id);

-- ─── 6. Ajustar bracket_predictions si faltan columnas ───────────────────────

-- Nada que cambiar en bracket_predictions, ya estaba bien.

-- ─── 7. Storage: bucket avatars ──────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
drop policy if exists "Users can upload their own avatar"     on storage.objects;
drop policy if exists "Users can update their own avatar"     on storage.objects;
drop policy if exists "Users can delete their own avatar"     on storage.objects;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── 8. Forzar recarga del schema cache de PostgREST ─────────────────────────
-- CRITICAL: sin esto, Supabase no detecta las nuevas tablas hasta el siguiente ciclo.

notify pgrst, 'reload schema';
