-- Make handle_new_user tolerant of username collisions.
-- If the chosen username already exists, append a short random suffix and
-- retry instead of failing the auth.users insert, which surfaces to the
-- client as the opaque "Database error saving new user".

create or replace function public.handle_new_user()
returns trigger as $$
declare
  requested_username text;
  final_username text;
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

  insert into public.profiles (id, username, display_name, role)
  values (
    new.id,
    final_username,
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data->>'role', 'learner')
  )
  on conflict (id) do update
  set
    username = excluded.username,
    display_name = excluded.display_name,
    role = excluded.role;

  return new;
end;
$$ language plpgsql security definer set search_path = public, extensions;
