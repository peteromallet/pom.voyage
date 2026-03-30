create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_title text not null,
  emoji text not null default '',
  linkedin_url text,
  location text,
  body_markdown text not null,
  intro_url text,
  is_hired boolean not null default false,
  is_freelancer boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recommendations enable row level security;

create policy "Public can read recommendations"
  on public.recommendations
  for select
  to public
  using (true);
