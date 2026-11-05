-- =====================================================================
-- NIMBUS QUIZ — Estrutura do banco (Supabase / PostgreSQL)
-- Execute este arquivo INTEIRO no SQL Editor, nos DOIS projetos (dev e prod).
-- É seguro rodar mais de uma vez (usa "if not exists" / "or replace").
-- =====================================================================

-- ---------- TABELAS ---------------------------------------------------

create table if not exists public.questions (
  id        bigint generated always as identity primary key,
  text      text    not null check (char_length(text) between 3 and 500),
  position  integer not null default 0,
  active    boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.options (
  id          bigint generated always as identity primary key,
  question_id bigint  not null references public.questions(id) on delete cascade,
  text        text    not null check (char_length(text) between 1 and 300),
  is_correct  boolean not null default false
);

-- Garante exatamente UMA alternativa correta por pergunta (no máximo uma aqui)
create unique index if not exists options_one_correct_per_question
  on public.options (question_id) where is_correct;

create index if not exists options_question_idx on public.options (question_id);

create table if not exists public.participants (
  id             uuid primary key default gen_random_uuid(),
  name           text    not null check (char_length(btrim(name)) between 2 and 24),
  score          integer not null default 0,
  correct_count  integer not null default 0,
  wrong_count    integer not null default 0,
  total_time_ms  integer not null default 0,
  status         text    not null default 'playing' check (status in ('playing', 'finished')),
  created_at     timestamptz not null default now(),
  finished_at    timestamptz
);

-- Nome único, sem diferenciar maiúsculas/minúsculas nem espaços nas pontas
create unique index if not exists participants_name_unique
  on public.participants (lower(btrim(name)));

create index if not exists participants_ranking_idx
  on public.participants (score desc, total_time_ms asc) where status = 'finished';

create table if not exists public.answers (
  id             bigint generated always as identity primary key,
  participant_id uuid   not null references public.participants(id) on delete cascade,
  question_id    bigint not null references public.questions(id)    on delete cascade,
  option_id      bigint references public.options(id) on delete set null, -- null = tempo esgotado
  is_correct     boolean not null default false,
  time_ms        integer not null default 0 check (time_ms >= 0),
  points         integer not null default 0 check (points >= 0),
  created_at     timestamptz not null default now(),
  -- impede resposta duplicada para a mesma pergunta
  constraint answers_one_per_question unique (participant_id, question_id)
);

create index if not exists answers_participant_idx on public.answers (participant_id);

-- ---------- VIEW DO RANKING -------------------------------------------
-- Só quem terminou. Maior pontuação primeiro; empate => menor tempo.

create or replace view public.ranking as
select
  rank() over (order by score desc, total_time_ms asc) as position,
  id,
  name,
  score,
  correct_count,
  wrong_count,
  total_time_ms,
  finished_at
from public.participants
where status = 'finished';

-- ---------- ACESSO PÚBLICO (sem login) --------------------------------
-- O app usa só a chave "anon". As políticas abaixo liberam o mínimo necessário.

alter table public.questions    enable row level security;
alter table public.options      enable row level security;
alter table public.participants enable row level security;
alter table public.answers      enable row level security;

drop policy if exists "questions_read"  on public.questions;
drop policy if exists "options_read"    on public.options;
drop policy if exists "participants_read"   on public.participants;
drop policy if exists "participants_insert" on public.participants;
drop policy if exists "participants_update" on public.participants;
drop policy if exists "answers_read"   on public.answers;
drop policy if exists "answers_insert" on public.answers;

create policy "questions_read" on public.questions    for select to anon using (true);
create policy "options_read"   on public.options      for select to anon using (true);

create policy "participants_read"   on public.participants for select to anon using (true);
create policy "participants_insert" on public.participants for insert to anon
  with check (status = 'playing' and score = 0);
-- só dá para atualizar quem ainda está jogando (não reabre quem já finalizou)
create policy "participants_update" on public.participants for update to anon
  using (status = 'playing') with check (true);

create policy "answers_read"   on public.answers for select to anon using (true);
create policy "answers_insert" on public.answers for insert to anon with check (true);

grant usage on schema public to anon;
grant select                 on public.questions    to anon;
grant select                 on public.options      to anon;
grant select, insert, update on public.participants to anon;
grant select, insert         on public.answers      to anon;
grant select                 on public.ranking      to anon;
grant usage, select on all sequences in schema public to anon;
