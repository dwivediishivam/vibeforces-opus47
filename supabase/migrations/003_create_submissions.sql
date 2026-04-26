create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  context_type text not null check (context_type in ('practice', 'contest', 'test')),
  context_id uuid,
  prompts jsonb not null,
  ai_responses jsonb,
  user_ranking jsonb,
  generated_screenshot_url text,
  accuracy_score numeric,
  token_score numeric,
  time_taken_seconds integer,
  combined_score numeric,
  judge_feedback jsonb,
  status text default 'pending' check (status in ('pending', 'running', 'judging', 'completed', 'error')),
  created_at timestamptz default now(),
  completed_at timestamptz
);

create index if not exists idx_submissions_user on public.submissions(user_id);
create index if not exists idx_submissions_challenge on public.submissions(challenge_id);
create index if not exists idx_submissions_context on public.submissions(context_type, context_id);
