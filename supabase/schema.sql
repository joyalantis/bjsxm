-- BJxM Fitness Challenge — Supabase Schema
-- Paste this into the Supabase SQL Editor and click Run

-- Family members (shared across all devices)
create table if not exists family_members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  tone int not null default 2,
  created_at timestamptz default now()
);

-- Activity logs (all members stored here; app filters per-user in personal views)
create table if not exists activity_logs (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references family_members(id) on delete cascade not null,
  type text not null,
  count numeric not null,
  unit text not null,
  day int not null,
  month int not null,
  year int not null,
  ts bigint not null,
  created_at timestamptz default now()
);

-- Row Level Security (open access — family app, no auth needed)
alter table family_members enable row level security;
alter table activity_logs enable row level security;

drop policy if exists "Public family_members" on family_members;
drop policy if exists "Public activity_logs" on activity_logs;

create policy "Public family_members" on family_members for all using (true) with check (true);
create policy "Public activity_logs" on activity_logs for all using (true) with check (true);

-- Enable real-time
alter publication supabase_realtime add table family_members;
alter publication supabase_realtime add table activity_logs;

-- Default family members — edit names/tones to match your family
insert into family_members (name, tone) values
  ('Member 1', 2),
  ('Member 2', 4),
  ('Member 3', 0)
on conflict do nothing;
