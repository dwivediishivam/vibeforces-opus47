-- Production hardening for public signup, recruiter trial limits, and hire leads.

alter table public.profiles
  add column if not exists recruiter_plan text not null default 'trial'
    check (recruiter_plan in ('trial', 'paid', 'enterprise')),
  add column if not exists recruiter_test_limit integer not null default 3,
  add column if not exists recruiter_candidate_limit integer not null default 10;

create table if not exists public.hire_leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  expected_candidates integer,
  plan_interest text,
  needs_custom_questions boolean not null default false,
  message text,
  created_at timestamptz not null default now()
);

alter table public.hire_leads enable row level security;

drop policy if exists "hire_leads_admin_read" on public.hire_leads;
create policy "hire_leads_admin_read" on public.hire_leads
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create or replace function public.handle_new_user()
returns trigger as $$
declare
  requested_username text;
  final_username text;
  requested_role text;
  final_role text;
  attempts integer := 0;
begin
  requested_username := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    split_part(new.email, '@', 1)
  );
  final_username := requested_username;

  while attempts < 10 and exists (
    select 1 from public.profiles
    where username = final_username
      and id <> new.id
  ) loop
    final_username := requested_username || '_' || substr(
      encode(extensions.gen_random_bytes(3), 'hex'), 1, 4
    );
    attempts := attempts + 1;
  end loop;

  requested_role := coalesce(new.raw_user_meta_data->>'role', 'learner');
  final_role := case
    when requested_role = 'admin'
      and lower(new.email) in ('admin@vibeforces.dev', 'dwivediishivam@gmail.com')
      then 'admin'
    when requested_role = 'recruiter'
      then 'recruiter'
    else 'learner'
  end;

  insert into public.profiles (id, username, display_name, role)
  values (
    new.id,
    final_username,
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      split_part(new.email, '@', 1)
    ),
    final_role
  )
  on conflict (id) do update
  set
    username = excluded.username,
    display_name = excluded.display_name,
    role = excluded.role;

  return new;
end;
$$ language plpgsql security definer set search_path = public, extensions;

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
  and p.role = 'learner'
  and p.username not in ('admin', 'dwivediishivam')
group by p.id, p.username, p.display_name, p.avatar_url
order by total_score desc;
