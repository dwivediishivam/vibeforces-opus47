create table if not exists public.recruiter_tests (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  challenge_ids uuid[] not null,
  time_limit_minutes integer not null default 60,
  share_code text unique default encode(gen_random_bytes(8), 'hex'),
  is_active boolean default true,
  proctoring_enabled boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.recruiter_tests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  total_score numeric default 0,
  status text default 'in_progress' check (status in ('in_progress', 'completed', 'timed_out')),
  started_at timestamptz default now(),
  completed_at timestamptz,
  unique (test_id, user_id)
);

create index if not exists idx_recruiter_tests_recruiter on public.recruiter_tests(recruiter_id);
create index if not exists idx_test_attempts_test on public.test_attempts(test_id);
