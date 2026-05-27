-- ============================================================
--  MUNDIAL 2026 — Schema completo
--  Ejecutar en: Supabase > SQL Editor
--  Orden: 0º 00_drop_all.sql  →  1º este  →  2º 02_seed_matches.sql
-- ============================================================

create extension if not exists "uuid-ossp";

-- ─── Constantes ───────────────────────────────────────────────────────────────
-- Fecha de cierre de predicciones: primer partido, 11 junio 2026 19:00 UTC
-- (México vs Sudáfrica, Estadio Azteca)

-- ─── Profiles ─────────────────────────────────────────────────────────────────

create table public.profiles (
  id                     uuid primary key references auth.users on delete cascade,
  username               text unique not null,
  display_name           text not null default '',
  avatar_url             text,
  country                text,
  favorite_team_id       text,
  is_public              boolean not null default true,
  is_predictions_public  boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles readable by all"
  on public.profiles for select using (true);

create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- ─── Matches (resultados oficiales) ──────────────────────────────────────────

create table public.matches (
  id               text primary key,
  phase            text not null check (phase in (
                     'group','round_of_32','round_of_16',
                     'quarterfinal','semifinal','third_place','final'
                   )),
  group_id         text,
  home_team_id     text,
  away_team_id     text,
  home_score       int,
  away_score       int,
  home_score_extra int,
  away_score_extra int,
  home_penalties   int,
  away_penalties   int,
  winner_id        text,
  status           text not null default 'scheduled'
                   check (status in ('scheduled','live','finished','postponed')),
  scheduled_at     timestamptz not null,
  venue            text not null default '',
  matchday         int,
  round_slot       int,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.matches enable row level security;

create policy "Matches publicly readable"
  on public.matches for select using (true);

create policy "Service role manages matches"
  on public.matches for all
  using     (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ─── Group Order Predictions ──────────────────────────────────────────────────
-- El usuario elige el orden final de cada grupo: [1º, 2º, 3º, 4º] team IDs.
-- Una fila por usuario por grupo (12 filas por usuario en total).

create table public.group_order_predictions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  group_id      text not null,                -- 'A'–'L'
  team_order    text[] not null,              -- longitud 4, teamIds en orden [1º,2º,3º,4º]
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, group_id)
);

alter table public.group_order_predictions enable row level security;

create policy "Group order preds viewable by all"
  on public.group_order_predictions for select using (true);

create policy "Users manage own group order preds before lock"
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

-- ─── Third Place Predictions ──────────────────────────────────────────────────
-- Los 8 mejores terceros en orden del usuario: ranking[0] = mejor, ranking[7] = 8º.
-- Una sola fila por usuario.

create table public.third_place_predictions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  ranking       text[] not null,              -- longitud 8, teamIds en orden
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id)
);

alter table public.third_place_predictions enable row level security;

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

-- ─── Bracket Predictions (ganadores fase eliminatoria) ────────────────────────
-- Una fila por cruce (P73–P104) por usuario.

create table public.bracket_predictions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  slot       text not null,    -- 'P73'…'P104'
  team_id    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slot)
);

alter table public.bracket_predictions enable row level security;

create policy "Bracket preds viewable by all"
  on public.bracket_predictions for select using (true);

create policy "Users insert own bracket preds before lock"
  on public.bracket_predictions for insert with check (
    auth.uid() = user_id
    and now() < '2026-06-11 19:00:00+00'::timestamptz
  );

create policy "Users update own bracket preds before lock"
  on public.bracket_predictions for update using (
    auth.uid() = user_id
    and now() < '2026-06-11 19:00:00+00'::timestamptz
  );

create policy "Users delete own bracket preds before lock"
  on public.bracket_predictions for delete using (
    auth.uid() = user_id
    and now() < '2026-06-11 19:00:00+00'::timestamptz
  );

-- ─── Match Bonus Predictions (score exacto por partido) ──────────────────────
-- Sistema separado. Cada partido bloquea individualmente en su hora de inicio.
-- Vale +2 pts si el score exacto es correcto.

create table public.match_bonus_predictions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  match_id      text not null references public.matches(id) on delete cascade,
  home_score    int not null,
  away_score    int not null,
  points_earned int not null default 0,
  locked        boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, match_id)
);

alter table public.match_bonus_predictions enable row level security;

create policy "Bonus preds viewable (public profiles)"
  on public.match_bonus_predictions for select using (
    exists (
      select 1 from public.profiles p
      where p.id = match_bonus_predictions.user_id
        and p.is_predictions_public = true
    )
    or auth.uid() = user_id
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

-- ─── Leaderboard ──────────────────────────────────────────────────────────────

create table public.leaderboard (
  user_id         uuid primary key references public.profiles(id) on delete cascade,
  total_points    int not null default 0,
  -- Desglose por categoría (coincide con TotalScore en lib/types.ts)
  group_qualifier int not null default 0,
  group_position  int not null default 0,
  thirds_selected int not null default 0,
  thirds_order    int not null default 0,
  knockout_pts    int not null default 0,
  bonus_score     int not null default 0,
  rank            int,
  previous_rank   int,
  last_updated    timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

create policy "Leaderboard publicly readable"
  on public.leaderboard for select using (true);

-- ─── Función: auto-crear profile y leaderboard al registrarse ────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.leaderboard (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Función: updated_at automático ──────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger set_matches_updated_at
  before update on public.matches
  for each row execute procedure public.handle_updated_at();

create trigger set_group_order_preds_updated_at
  before update on public.group_order_predictions
  for each row execute procedure public.handle_updated_at();

create trigger set_third_preds_updated_at
  before update on public.third_place_predictions
  for each row execute procedure public.handle_updated_at();

create trigger set_bracket_preds_updated_at
  before update on public.bracket_predictions
  for each row execute procedure public.handle_updated_at();

create trigger set_bonus_preds_updated_at
  before update on public.match_bonus_predictions
  for each row execute procedure public.handle_updated_at();

-- ─── Storage: bucket avatars ──────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

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

-- ─── Realtime ─────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.leaderboard;

-- ─── Índices ──────────────────────────────────────────────────────────────────

create index idx_grp_order_preds_user    on public.group_order_predictions(user_id);
create index idx_third_preds_user        on public.third_place_predictions(user_id);
create index idx_bracket_preds_user      on public.bracket_predictions(user_id);
create index idx_bonus_preds_user        on public.match_bonus_predictions(user_id);
create index idx_bonus_preds_match       on public.match_bonus_predictions(match_id);
create index idx_leaderboard_rank        on public.leaderboard(rank);
create index idx_matches_phase           on public.matches(phase);
create index idx_matches_group           on public.matches(group_id);
create index idx_matches_status          on public.matches(status);
