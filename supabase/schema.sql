create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  date date not null,
  draft boolean default false,
  markdown text not null,
  excerpt text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table posts enable row level security;

create policy "Public read published posts"
  on posts
  for select
  using (draft = false);

alter table measurements enable row level security;

create policy "Public read measurements"
  on measurements
  for select
  using (true);
