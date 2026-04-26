create table if not exists public.contests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 120,
  challenge_ids uuid[] not null,
  status text default 'upcoming' check (status in ('upcoming', 'active', 'completed')),
  share_code text unique default encode(gen_random_bytes(6), 'hex'),
  is_public boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.contest_participants (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  total_score numeric default 0,
  total_time_seconds integer default 0,
  rank integer,
  joined_at timestamptz default now(),
  unique (contest_id, user_id)
);

create index if not exists idx_contests_scheduled_at on public.contests(scheduled_at);
create index if not exists idx_contest_participants_contest on public.contest_participants(contest_id);
