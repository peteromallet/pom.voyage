create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  x_username text,
  x_user_id text,
  x_avatar_url text,
  x_followers_count integer,
  is_suspicious boolean generated always as (coalesce(x_followers_count, 0) < 100) stored,
  feedback_text text not null check (char_length(feedback_text) <= 1000),
  image_paths text[] not null default '{}',
  owner_response text,
  owner_response_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "Public can read feedback"
  on public.feedback
  for select
  to public
  using (true);

create policy "Authenticated users can insert own feedback"
  on public.feedback
  for insert
  to authenticated
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('feedback-images', 'feedback-images', true)
on conflict (id) do nothing;

create policy "Public read access on feedback images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'feedback-images');

create policy "Authenticated upload access on feedback images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'feedback-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
