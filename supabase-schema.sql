-- ============================================
-- InterpretAid — Supabase SQL Schema
-- Colle dans SQL Editor > Run
-- ============================================

create table if not exists user_credits (
  user_id     text primary key,
  credits     int not null default 5,
  last_reset  timestamptz not null default now(),
  is_premium  boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists analyses (
  id                uuid primary key default gen_random_uuid(),
  user_id           text not null,
  mode              text not null,
  lang              text not null default 'fr',
  input_text        text not null,
  result            jsonb not null,
  red_flag_score    int default 0,
  confidence_score  int default 0,
  person_name       text,
  created_at        timestamptz not null default now()
);

create index if not exists analyses_user_id_idx on analyses (user_id, created_at desc);
create index if not exists analyses_person_idx on analyses (user_id, person_name, created_at desc);
