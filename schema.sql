create table if not exists registrations (
  id text primary key,
  name text not null,
  phone text not null unique,
  faculty text not null,
  class_name text not null,
  course text not null,
  bans text not null default '[]',
  reason text not null default '',
  strengths text not null default '',
  expectation text not null default '',
  assigned_ban text default null,
  created_at text not null,
  updated_at text not null
);

create index if not exists registrations_updated_at_idx
on registrations(updated_at desc);
