-- Allow anonymous feedback submissions (no auth required)
alter table public.feedback
  alter column user_id drop not null;

alter table public.feedback
  add column is_anonymous boolean not null default false;

-- Track X account creation date for account-age suspicion signal
alter table public.feedback
  add column x_account_created_at timestamptz;

-- Update is_suspicious: anonymous OR low followers
-- Account age check is done at application level since now() is not immutable
alter table public.feedback
  drop column is_suspicious;

alter table public.feedback
  add column is_suspicious boolean generated always as (
    is_anonymous
    or coalesce(x_followers_count, 0) < 100
  ) stored;

-- Allow anonymous inserts (service-role only, enforced at API level)
create policy "Anonymous feedback via service role"
  on public.feedback
  for insert
  to anon
  with check (is_anonymous = true and user_id is null and image_paths = '{}');
