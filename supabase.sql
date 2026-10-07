-- Execute este script uma vez no Supabase: SQL Editor > New query > Run.
-- Cria a tabela de avaliações e garante que cada pessoa só acesse as próprias linhas.

create table public.avaliacoes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data           date    not null,
  peso           numeric not null check (peso > 0),
  altura         numeric not null check (altura > 0),
  busto          numeric not null check (busto > 0),
  cintura        numeric not null check (cintura > 0),
  abdomen        numeric not null check (abdomen > 0),
  quadril        numeric not null check (quadril > 0),
  gordura        numeric not null check (gordura between 1 and 70),
  visceral       numeric not null check (visceral >= 0),
  idade_corporal numeric not null check (idade_corporal > 0),
  musculo        numeric not null check (musculo between 1 and 70),
  metabolismo    numeric not null check (metabolismo > 0),
  criado_em      timestamptz not null default now()
);

create index avaliacoes_usuario_data_idx on public.avaliacoes (user_id, data);

alter table public.avaliacoes enable row level security;

create policy "ver proprias avaliacoes" on public.avaliacoes
  for select to authenticated using (user_id = (select auth.uid()));

create policy "criar proprias avaliacoes" on public.avaliacoes
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy "excluir proprias avaliacoes" on public.avaliacoes
  for delete to authenticated using (user_id = (select auth.uid()));
