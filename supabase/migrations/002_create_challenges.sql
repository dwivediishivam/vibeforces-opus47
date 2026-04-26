create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  category text not null check (category in (
    'spec_to_prompt',
    'token_golf',
    'bug_fix',
    'architecture_pick',
    'ui_reproduction'
  )),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  rating integer not null check (rating >= 800 and rating <= 2500),
  title text not null,
  description text not null,
  challenge_data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_challenges_category on public.challenges(category);
create index if not exists idx_challenges_difficulty on public.challenges(difficulty);
create index if not exists idx_challenges_rating on public.challenges(rating);
create index if not exists idx_challenges_code on public.challenges(code);

drop trigger if exists challenges_set_updated_at on public.challenges;
create trigger challenges_set_updated_at
before update on public.challenges
for each row execute function public.set_updated_at();
