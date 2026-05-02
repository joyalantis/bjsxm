-- BJxM Fitness Challenge — Supabase Schema
-- Paste this into the Supabase SQL Editor and click Run

-- Members (shared across all devices)
create table if not exists members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  tone int not null default 2,
  created_at timestamptz default now()
);

-- Workouts (denormalized member name/tone for fast reads, no joins needed)
create table if not exists workouts (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references members(id) on delete cascade not null,
  member_name text not null,
  member_tone int not null default 2,
  type text not null,
  count numeric not null,
  unit text not null,
  day int not null,
  month int not null,
  year int not null,
  ts bigint not null,
  created_at timestamptz default now()
);

-- Challenges (one row per month, id = 0..11)
create table if not exists challenges (
  id int primary key,
  ex1 text,
  g1 numeric,
  ex2 text,
  g2 numeric,
  updated_at timestamptz default now()
);

-- Row Level Security (open access — family app, no auth needed)
alter table members enable row level security;
alter table workouts enable row level security;
alter table challenges enable row level security;

drop policy if exists "Public members" on members;
drop policy if exists "Public workouts" on workouts;
drop policy if exists "Public challenges" on challenges;

create policy "Public members" on members for all using (true) with check (true);
create policy "Public workouts" on workouts for all using (true) with check (true);
create policy "Public challenges" on challenges for all using (true) with check (true);
