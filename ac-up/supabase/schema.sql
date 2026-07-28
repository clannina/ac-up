-- ============================================================
-- AC UP — schema database (Supabase / PostgreSQL)
-- Da eseguire in: Supabase → SQL Editor → New query → Run
-- ============================================================

-- Estensioni utili
create extension if not exists "uuid-ossp";

-- ---------- PROFILI UTENTE ----------
-- Supabase Auth crea automaticamente auth.users; qui teniamo i dati pubblici collegati
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  obiettivo text,
  created_at timestamptz default now()
);

-- ---------- INGREDIENTI ----------
create table if not exists public.ingredients (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  categoria text, -- es. carne, pesce, legumi, verdura, frutta, latticini, cereali
  stagione text,
  created_at timestamptz default now()
);

-- ---------- RICETTE ----------
create table if not exists public.recipes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  categoria text not null, -- carne | pesce | legumi | uova_latticini | colazioni
  foto_url text,
  procedimento text,
  valori_nutrizionali jsonb, -- {kcal, proteine, carboidrati, grassi}
  tempo_min integer,
  difficolta text, -- facile | media | difficile
  meal_prep boolean default false,
  adatta_ufficio boolean default false,
  congelabile boolean default false,
  stagione text default 'tutto l''anno',
  created_at timestamptz default now()
);

-- ---------- INGREDIENTI PER RICETTA ----------
create table if not exists public.recipe_ingredients (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid references public.recipes (id) on delete cascade,
  ingredient_id uuid references public.ingredients (id) on delete cascade,
  quantita text, -- es. "150 g"
  sostituzioni text[] -- elenco di alternative
);

-- ---------- PIANI PASTO ----------
create table if not exists public.meal_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete cascade,
  data date not null,
  pasto text not null, -- colazione | spuntino | pranzo | merenda | cena
  recipe_id uuid references public.recipes (id),
  note text,
  created_at timestamptz default now()
);

-- ---------- LISTE DELLA SPESA ----------
create table if not exists public.shopping_lists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete cascade,
  titolo text default 'Lista della spesa',
  settimana_riferimento date,
  created_at timestamptz default now()
);

create table if not exists public.shopping_items (
  id uuid primary key default uuid_generate_v4(),
  shopping_list_id uuid references public.shopping_lists (id) on delete cascade,
  nome text not null,
  quantita text,
  reparto text, -- es. frutta e verdura, macelleria, pescheria, dispensa, frigo
  completato boolean default false
);

-- ---------- MISURAZIONI SALUTE ----------
create table if not exists public.measurements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete cascade,
  tipo text not null, -- peso | pressione | acqua
  valore jsonb not null, -- es. {"kg": 96.4} oppure {"sistolica":120,"diastolica":80}
  registrato_il timestamptz default now()
);

-- ---------- PREFERENZE ALIMENTARI ----------
create table if not exists public.preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete cascade,
  ingredient_id uuid references public.ingredients (id) on delete cascade,
  stato text not null check (stato in ('preferito','approvato','da_provare','escluso')),
  updated_at timestamptz default now()
);

-- ---------- VALUTAZIONI RICETTE ----------
create table if not exists public.recipe_ratings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete cascade,
  recipe_id uuid references public.recipes (id) on delete cascade,
  voto integer check (voto between 1 and 5),
  commento text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY — ogni utente vede/modifica solo i propri dati
-- Ricette e ingredienti restano leggibili da tutti gli utenti autenticati.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.meal_plans enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;
alter table public.measurements enable row level security;
alter table public.preferences enable row level security;
alter table public.recipe_ratings enable row level security;
alter table public.recipes enable row level security;
alter table public.ingredients enable row level security;
alter table public.recipe_ingredients enable row level security;

create policy "profilo proprio" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "meal plan proprio" on public.meal_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "liste spesa proprie" on public.shopping_lists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "voci spesa proprie" on public.shopping_items
  for all using (
    shopping_list_id in (select id from public.shopping_lists where user_id = auth.uid())
  );

create policy "misurazioni proprie" on public.measurements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "preferenze proprie" on public.preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "valutazioni proprie" on public.recipe_ratings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "ricette leggibili da autenticati" on public.recipes
  for select using (auth.role() = 'authenticated');

create policy "ingredienti leggibili da autenticati" on public.ingredients
  for select using (auth.role() = 'authenticated');

create policy "ingredienti ricetta leggibili da autenticati" on public.recipe_ingredients
  for select using (auth.role() = 'authenticated');
