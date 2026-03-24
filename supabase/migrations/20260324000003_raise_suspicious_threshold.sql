-- Raise suspicious follower threshold from 100 to 500
alter table public.feedback
  drop column is_suspicious;

alter table public.feedback
  add column is_suspicious boolean generated always as (
    is_anonymous
    or coalesce(x_followers_count, 0) < 500
  ) stored;
