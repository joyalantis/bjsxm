-- BJsxM Fitness Challenge Schema
-- Run this in your Supabase SQL editor to set up the database

-- Family members
create table if not exists family_members (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  avatar text not null default '🧑',
  color text not null default '#6366f1',
  created_at timestamptz default now()
);

-- Monthly challenges (2 per month)
create table if not exists challenges (
  id uuid default gen_random_uuid() primary key,
  year int not null,
  month int not null check (month between 1 and 12),
  exercise_name text not null,
  goal_value numeric not null,
  unit text not null,
  description text,
  icon text not null default '💪',
  created_at timestamptz default now(),
  unique(year, month, exercise_name)
);

-- Activity logs (one row per member per challenge per day)
create table if not exists activity_logs (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references family_members(id) on delete cascade not null,
  challenge_id uuid references challenges(id) on delete cascade not null,
  log_date date not null,
  value numeric not null check (value > 0),
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table family_members enable row level security;
alter table challenges enable row level security;
alter table activity_logs enable row level security;

-- Allow public read/write (family app, no auth needed)
create policy "Public read family_members" on family_members for select using (true);
create policy "Public insert family_members" on family_members for insert with check (true);
create policy "Public update family_members" on family_members for update using (true);

create policy "Public read challenges" on challenges for select using (true);
create policy "Public insert challenges" on challenges for insert with check (true);
create policy "Public update challenges" on challenges for update using (true);
create policy "Public delete challenges" on challenges for delete using (true);

create policy "Public read activity_logs" on activity_logs for select using (true);
create policy "Public insert activity_logs" on activity_logs for insert with check (true);
create policy "Public update activity_logs" on activity_logs for update using (true);
create policy "Public delete activity_logs" on activity_logs for delete using (true);

-- Enable realtime for all tables
alter publication supabase_realtime add table family_members;
alter publication supabase_realtime add table challenges;
alter publication supabase_realtime add table activity_logs;

-- Seed: default family members (edit as needed)
insert into family_members (name, avatar, color) values
  ('Mom', '👩', '#ec4899'),
  ('Dad', '👨', '#3b82f6'),
  ('Kid 1', '🧒', '#f59e0b'),
  ('Kid 2', '🧒', '#10b981')
on conflict (name) do nothing;

-- Seed: current month challenge (May 2026)
insert into challenges (year, month, exercise_name, goal_value, unit, description, icon) values
  (2026, 5, 'Push-ups', 500, 'reps', 'Do 500 push-ups total this month', '💪'),
  (2026, 5, 'Walking', 30, 'miles', 'Walk 30 miles total this month', '🚶')
on conflict (year, month, exercise_name) do nothing;
