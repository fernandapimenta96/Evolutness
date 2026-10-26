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

-- ---------------------------------------------------------------------------
-- Parte 2 — Perfil (data de nascimento), usada para escolher a faixa etária de
-- referência da gordura corporal e do músculo esquelético.
-- Quem já executou a parte 1 acima deve executar apenas daqui para baixo.
-- ---------------------------------------------------------------------------

create table if not exists public.perfis (
  user_id         uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data_nascimento date not null check (data_nascimento >= date '1900-01-01' and data_nascimento <= current_date),
  atualizado_em   timestamptz not null default now()
);

alter table public.perfis enable row level security;

drop policy if exists "ver proprio perfil" on public.perfis;
create policy "ver proprio perfil" on public.perfis
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "criar proprio perfil" on public.perfis;
create policy "criar proprio perfil" on public.perfis
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "atualizar proprio perfil" on public.perfis;
create policy "atualizar proprio perfil" on public.perfis
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));


-- ---------------------------------------------------------------------------
-- Parte 3 — Perfil: nome e sexo. Os cálculos abrangem apenas mulheres de 20 a 79 anos.
-- ---------------------------------------------------------------------------

alter table public.perfis add column if not exists nome text check (char_length(nome) between 1 and 80);
alter table public.perfis add column if not exists sexo text check (sexo = 'feminino');
