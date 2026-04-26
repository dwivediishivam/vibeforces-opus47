alter table public.profiles enable row level security;
alter table public.challenges enable row level security;
alter table public.submissions enable row level security;
alter table public.contests enable row level security;
alter table public.contest_participants enable row level security;
alter table public.recruiter_tests enable row level security;
alter table public.test_attempts enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
on public.profiles for select
using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

drop policy if exists "Challenges are viewable by everyone" on public.challenges;
create policy "Challenges are viewable by everyone"
on public.challenges for select
using (true);

drop policy if exists "Users see own submissions" on public.submissions;
create policy "Users see own submissions"
on public.submissions for select
using (auth.uid() = user_id);

drop policy if exists "Users create own submissions" on public.submissions;
create policy "Users create own submissions"
on public.submissions for insert
with check (auth.uid() = user_id);

drop policy if exists "Contest rows are viewable by everyone" on public.contests;
create policy "Contest rows are viewable by everyone"
on public.contests for select
using (true);

drop policy if exists "Contest participants can see themselves" on public.contest_participants;
create policy "Contest participants can see themselves"
on public.contest_participants for select
using (true);

drop policy if exists "Learners can join contests" on public.contest_participants;
create policy "Learners can join contests"
on public.contest_participants for insert
with check (auth.uid() = user_id);

drop policy if exists "Recruiters see own tests" on public.recruiter_tests;
create policy "Recruiters see own tests"
on public.recruiter_tests for all
using (
  auth.uid() = recruiter_id
  or exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
)
with check (
  auth.uid() = recruiter_id
  or exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

drop policy if exists "Users can see own test attempts" on public.test_attempts;
create policy "Users can see own test attempts"
on public.test_attempts for select
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.recruiter_tests
    where recruiter_tests.id = test_attempts.test_id
      and recruiter_tests.recruiter_id = auth.uid()
  )
);

drop policy if exists "Users can create own test attempts" on public.test_attempts;
create policy "Users can create own test attempts"
on public.test_attempts for insert
with check (auth.uid() = user_id);

create or replace view public.practice_leaderboard as
select
  p.id as user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  count(distinct s.challenge_id) as challenges_solved,
  round(avg(s.accuracy_score), 2) as avg_accuracy,
  round(avg(s.token_score), 2) as avg_token_efficiency,
  round(avg(s.time_taken_seconds), 0) as avg_time_seconds,
  round(avg(s.combined_score), 2) as avg_combined_score,
  coalesce(sum(s.combined_score), 0) as total_score
from public.profiles p
join public.submissions s on s.user_id = p.id
where s.context_type = 'practice'
  and s.status = 'completed'
group by p.id, p.username, p.display_name, p.avatar_url
order by total_score desc;
