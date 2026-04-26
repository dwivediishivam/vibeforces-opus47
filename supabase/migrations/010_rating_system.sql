-- Codeforces-style rating system

alter table public.profiles
  add column if not exists rating integer not null default 1200,
  add column if not exists rating_peak integer not null default 1200,
  add column if not exists rating_solves integer not null default 0;

create table if not exists public.rating_changes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  submission_id uuid references public.submissions(id) on delete set null,
  delta integer not null,
  rating_before integer not null,
  rating_after integer not null,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_rating_changes_user on public.rating_changes(user_id, created_at desc);
create index if not exists idx_profiles_rating on public.profiles(rating desc);

alter table public.rating_changes enable row level security;

drop policy if exists "rating_changes_self_read" on public.rating_changes;
create policy "rating_changes_self_read" on public.rating_changes
  for select using (auth.uid() = user_id);
