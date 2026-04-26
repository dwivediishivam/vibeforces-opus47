-- Extend challenge category check + raise rating ceiling for SDE2+ tier.

alter table public.challenges
  drop constraint if exists challenges_category_check;

alter table public.challenges
  add constraint challenges_category_check
  check (category in (
    'spec_to_prompt',
    'token_golf',
    'bug_fix',
    'architecture_pick',
    'ui_reproduction',
    'distributed_debug',
    'system_design_build',
    'agent_orchestration'
  ));

alter table public.challenges
  drop constraint if exists challenges_rating_check;

alter table public.challenges
  add constraint challenges_rating_check
  check (rating >= 800 and rating <= 2800);

-- New per-submission column to persist managed-agent traces (event ids,
-- tool calls, container outputs, task-budget consumption). nullable so
-- the existing 5 categories don't pay a write cost.
alter table public.submissions
  add column if not exists agent_trace jsonb;
