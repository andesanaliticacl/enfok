-- Run this once in the Supabase dashboard: Project -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run (uses "if not exists" / "or replace" throughout).

-- One row per signed-up user. `phone` is captured at signup for a future
-- "message the app on WhatsApp to create a mission" flow — not wired up yet.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- The entire app state (regions/goals/missions/inventory/places/profile +
-- avatar/biome), stored as JSON per user — mirrors what was already being
-- persisted to localStorage, just backed by the cloud so it survives across
-- devices and browser data clears.
create table if not exists public.app_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  game_state jsonb not null default '{}'::jsonb,
  avatar_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "Users can view their own app state" on public.app_state;
create policy "Users can view their own app state"
  on public.app_state for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own app state" on public.app_state;
create policy "Users can insert their own app state"
  on public.app_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own app state" on public.app_state;
create policy "Users can update their own app state"
  on public.app_state for update
  using (auth.uid() = user_id);
