-- ============================================================
--  MUNDIAL 2026 — Supabase Schema v2
-- ============================================================

create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────────────────────

create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  username      text unique not null,
  display_name  text not null default '',
  avatar_url    text,
  country       text,
  favorite_team text,
  is_public     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Profiles readable by all"         on public.profiles for select using (true);
create policy "Users insert own profile"         on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile"         on public.profiles for update using (auth.uid() = id);

-- ─── Matches ─────────────────────────────────────────────────────────────────

create table public.matches (
  id              text primary key,
  phase           text not null check (phase in ('group','round_of_32','round_of_16','quarterfinal','semifinal','third_place','final')),
  group_id        text,
  home_team_id    text,
  away_team_id    text,
  home_score      int,
  away_score      int,
  home_score_extra int,
  away_score_extra int,
  home_penalties  int,
  away_penalties  int,
  winner_id       text,
  status          text not null default 'scheduled' check (status in ('scheduled','live','finished','postponed')),
  scheduled_at    timestamptz not null,
  venue           text not null default '',
  matchday        int,
  round_slot      int,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.matches enable row level security;
create policy "Matches publicly readable"   on public.matches for select using (true);
create policy "Service role manages matches" on public.matches using (auth.role() = 'service_role');

-- ─── Predictions (match scores) ──────────────────────────────────────────────
-- Lock date = first match start: 2026-06-11 20:00 UTC

create table public.predictions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  match_id      text not null references public.matches(id) on delete cascade,
  home_score    int not null,
  away_score    int not null,
  winner_id     text,          -- knockout only
  points_earned int not null default 0,
  locked        boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, match_id)
);

alter table public.predictions enable row level security;

create policy "Predictions viewable (public profiles)" on public.predictions
  for select using (
    exists (select 1 from public.profiles p where p.id = predictions.user_id and p.is_public = true)
    or auth.uid() = user_id
  );

create policy "Users insert own predictions before lock" on public.predictions
  for insert with check (
    auth.uid() = user_id and now() < '2026-06-11 20:00:00+00'::timestamptz
  );

create policy "Users update own predictions before lock" on public.predictions
  for update using (
    auth.uid() = user_id and now() < '2026-06-11 20:00:00+00'::timestamptz and locked = false
  );

create policy "Users delete own predictions before lock" on public.predictions
  for delete using (
    auth.uid() = user_id and now() < '2026-06-11 20:00:00+00'::timestamptz
  );

-- ─── Group Predictions (computed standings per group) ─────────────────────────

create table public.group_predictions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  group_id      text not null,
  team_order    text[] not null,  -- [1st, 2nd, 3rd, 4th] team IDs
  points_earned int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, group_id)
);

alter table public.group_predictions enable row level security;
create policy "Group preds viewable"           on public.group_predictions for select using (true);
create policy "Users manage own group preds"   on public.group_predictions for all using (
  auth.uid() = user_id and now() < '2026-06-11 20:00:00+00'::timestamptz
);

-- ─── Bracket Predictions (knockout stage winners) ────────────────────────────

create table public.bracket_predictions (
  id        uuid primary key default uuid_generate_v4(),
  user_id   uuid not null references public.profiles(id) on delete cascade,
  slot      text not null,    -- 'P73'…'P104'
  team_id   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slot)
);

alter table public.bracket_predictions enable row level security;
create policy "Bracket preds viewable"          on public.bracket_predictions for select using (true);
create policy "Users manage own bracket preds"  on public.bracket_predictions for all using (
  auth.uid() = user_id and now() < '2026-06-11 20:00:00+00'::timestamptz
);

-- ─── Leaderboard ─────────────────────────────────────────────────────────────

create table public.leaderboard (
  user_id             uuid primary key references public.profiles(id) on delete cascade,
  total_points        int not null default 0,
  exact_score_pts     int not null default 0,
  correct_result_pts  int not null default 0,
  group_position_pts  int not null default 0,
  third_qualifier_pts int not null default 0,
  knockout_pts        int not null default 0,
  exact_knockout_pts  int not null default 0,
  semifinalist_pts    int not null default 0,
  finalist_pts        int not null default 0,
  champion_pts        int not null default 0,
  rank                int,
  previous_rank       int,
  last_updated        timestamptz not null default now()
);

alter table public.leaderboard enable row level security;
create policy "Leaderboard publicly readable" on public.leaderboard for select using (true);

-- ─── Triggers ────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at    before update on public.profiles    for each row execute procedure public.handle_updated_at();
create trigger set_matches_updated_at     before update on public.matches     for each row execute procedure public.handle_updated_at();
create trigger set_predictions_updated_at before update on public.predictions for each row execute procedure public.handle_updated_at();

-- ─── Realtime ────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.leaderboard;
alter publication supabase_realtime add table public.predictions;

-- ─── Indexes ─────────────────────────────────────────────────────────────────

create index idx_predictions_user     on public.predictions(user_id);
create index idx_predictions_match    on public.predictions(match_id);
create index idx_grp_preds_user       on public.group_predictions(user_id);
create index idx_bracket_preds_user   on public.bracket_predictions(user_id);
create index idx_leaderboard_rank     on public.leaderboard(rank);
create index idx_matches_phase        on public.matches(phase);
create index idx_matches_group        on public.matches(group_id);
create index idx_matches_status       on public.matches(status);
