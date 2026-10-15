-- ===========================================================================
-- Bistro Starter Kit — Supabase schema
-- ---------------------------------------------------------------------------
-- Run this in the Supabase SQL editor (Database → SQL Editor → New query).
-- It creates the three tables the client expects, the indexes, an
-- `updated_at` trigger, row-level-security policies, and seeds the same demo
-- menu the local adapter uses.
--
-- Then in config.js:
--   backend.provider = 'supabase'
--   backend.supabase.url     = 'https://<project-ref>.supabase.co'
--   backend.supabase.anonKey = '<anon public key>'
--
-- IMPORTANT — read the security notes at the bottom before going live.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. menu_items
-- ---------------------------------------------------------------------------
create table if not exists public.menu_items (
  id           text primary key,
  category     text not null check (category in ('starters', 'mains', 'desserts', 'drinks')),
  name         text not null,
  description  text,
  price        numeric(10, 2) not null check (price >= 0),
  tags         text[] not null default '{}',
  image        text,
  available    boolean not null default true,
  featured     boolean not null default false,
  prep_minutes integer not null default 0,
  rating       numeric(3, 2),
  review_count integer not null default 0,
  sort_order   integer not null default 0,
  -- Optional per-language overrides, e.g.
  --   {"fr": {"name": "…", "description": "…"}, "am": { … }}
  translations jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists menu_items_category_idx on public.menu_items (category, sort_order);
create index if not exists menu_items_tags_idx on public.menu_items using gin (tags);

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  reference    text not null unique,
  type         text not null check (type in ('dine-in', 'takeaway', 'delivery')),
  table_number text,
  -- { "name": …, "phone": …, "email": …, "address": … }
  customer     jsonb not null default '{}'::jsonb,
  -- [{ "id": …, "name": …, "price": …, "qty": …, "tags": [] }]
  items        jsonb not null default '[]'::jsonb,
  -- { "subtotal": …, "tax": …, "total": …, "currency": "USD", … }
  totals       jsonb not null default '{}'::jsonb,
  -- { "gateway": "stripe", "status": "paid", "reference": "…", "simulated": false }
  payment      jsonb not null default '{}'::jsonb,
  notes        text,
  status       text not null default 'pending'
                 check (status in ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint orders_dine_in_needs_table
    check (type <> 'dine-in' or (table_number is not null and length(btrim(table_number)) > 0)),
  constraint orders_delivery_needs_address
    check (type <> 'delivery' or length(btrim(coalesce(customer ->> 'address', ''))) > 0)
);

create index if not exists orders_status_created_idx on public.orders (status, created_at desc);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. reservations
-- ---------------------------------------------------------------------------
create table if not exists public.reservations (
  id         uuid primary key default gen_random_uuid(),
  reference  text not null unique,
  name       text not null,
  phone      text not null,
  email      text,
  date       date not null,
  time       text not null,
  guests     integer not null check (guests between 1 and 40),
  notes      text,
  status     text not null default 'pending'
               check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reservations_date_idx on public.reservations (date, time);
create index if not exists reservations_status_idx on public.reservations (status);

drop trigger if exists reservations_set_updated_at on public.reservations;
create trigger reservations_set_updated_at
  before update on public.reservations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Row-level security
-- ---------------------------------------------------------------------------
-- The kit ships with the browser holding only the *anon* key, so these policies
-- are what actually protect the data.
--
-- The policies below are deliberately permissive enough for the demo to work
-- end-to-end (guest orders, then the same browser flips status in admin.html).
-- See the hardening notes at the bottom of this file.
-- ---------------------------------------------------------------------------

alter table public.menu_items   enable row level security;
alter table public.orders       enable row level security;
alter table public.reservations enable row level security;

-- menu_items: world-readable, writable by the dashboard -------------------
drop policy if exists "menu_items_read" on public.menu_items;
create policy "menu_items_read"
  on public.menu_items for select
  to anon, authenticated
  using (true);

drop policy if exists "menu_items_insert" on public.menu_items;
create policy "menu_items_insert"
  on public.menu_items for insert
  to anon, authenticated
  with check (true);

drop policy if exists "menu_items_update" on public.menu_items;
create policy "menu_items_update"
  on public.menu_items for update
  to anon, authenticated
  using (true)
  with check (true);

-- orders: guests may create; the dashboard reads and updates --------------
drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert"
  on public.orders for insert
  to anon, authenticated
  with check (status = 'pending');

drop policy if exists "orders_read" on public.orders;
create policy "orders_read"
  on public.orders for select
  to anon, authenticated
  using (true);

drop policy if exists "orders_update" on public.orders;
create policy "orders_update"
  on public.orders for update
  to anon, authenticated
  using (true)
  with check (true);

-- reservations: same shape as orders --------------------------------------
drop policy if exists "reservations_insert" on public.reservations;
create policy "reservations_insert"
  on public.reservations for insert
  to anon, authenticated
  with check (status in ('pending', 'confirmed'));

drop policy if exists "reservations_read" on public.reservations;
create policy "reservations_read"
  on public.reservations for select
  to anon, authenticated
  using (true);

drop policy if exists "reservations_update" on public.reservations;
create policy "reservations_update"
  on public.reservations for update
  to anon, authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- 6. Seed the demo menu (mirrors assets/js/seed-data.js)
-- ---------------------------------------------------------------------------
insert into public.menu_items
  (id, category, name, description, price, tags, image, available, featured, prep_minutes, rating, review_count, sort_order)
values
  ('st-01', 'starters', 'Burrata & Heirloom Tomato', 'Creamy Puglian burrata, sun-ripened heirloom tomatoes, basil oil and 12-year balsamic.', 14.50, '{vegetarian,glutenFree}', 'assets/images/dish-starter.svg', true, false, 8, 4.80, 126, 101),
  ('st-02', 'starters', 'Crispy Calamari', 'Semolina-dusted squid, preserved lemon aioli, Aleppo chilli.', 15.00, '{spicy}', 'assets/images/dish-starter.svg', true, false, 11, 4.60, 94, 102),
  ('st-03', 'starters', 'Roasted Beet Carpaccio', 'Candy beetroot, blood orange, toasted pistachio, sherry vinaigrette.', 12.00, '{vegan,glutenFree}', 'assets/images/dish-starter.svg', true, false, 9, 4.70, 61, 103),
  ('st-04', 'starters', 'Spiced Red Lentil Soup', 'Slow-simmered lentils, berbere, cumin butter, warm flatbread.', 9.50, '{vegetarian,spicy}', 'assets/images/dish-starter.svg', true, false, 7, 4.90, 203, 104),
  ('mn-01', 'mains', 'Dry-Aged Ribeye 300g', '35-day dry-aged ribeye, bone-marrow butter, triple-cooked chips, watercress.', 38.00, '{glutenFree}', 'assets/images/dish-main.svg', true, true, 24, 4.90, 311, 201),
  ('mn-02', 'mains', 'Pan-Seared Sea Bass', 'Line-caught bass, shaved fennel, saffron beurre blanc, sea herbs.', 29.00, '{glutenFree}', 'assets/images/dish-main.svg', true, false, 20, 4.70, 142, 202),
  ('mn-03', 'mains', 'Doro Wat Tagine', 'Free-range chicken braised in berbere and aged butter, soft egg, house injera.', 24.00, '{spicy,glutenFree}', 'assets/images/dish-main.svg', true, true, 26, 4.90, 268, 203),
  ('mn-04', 'mains', 'Wild Mushroom Risotto', 'Carnaroli rice, porcini and girolle, aged parmesan, truffle oil.', 22.00, '{vegetarian,glutenFree}', 'assets/images/dish-main.svg', true, false, 22, 4.80, 175, 204),
  ('mn-05', 'mains', 'Harissa Lamb Shank', 'Twelve-hour braised shank, rose harissa, apricot couscous, mint.', 32.00, '{spicy}', 'assets/images/dish-main.svg', true, false, 25, 4.80, 158, 205),
  ('ds-01', 'desserts', 'Dark Chocolate Fondant', '70% Valrhona fondant, molten centre, salted vanilla ice cream.', 12.00, '{vegetarian}', 'assets/images/dish-dessert.svg', true, true, 14, 4.90, 289, 301),
  ('ds-02', 'desserts', 'Pistachio Baklava Cheesecake', 'Baked cheesecake, layered filo, pistachio, orange-blossom honey.', 11.00, '{vegetarian}', 'assets/images/dish-dessert.svg', true, false, 10, 4.70, 117, 302),
  ('ds-03', 'desserts', 'Mango Sorbet Trio', 'Alphonso mango, lime and mint sorbets, coconut tuile.', 9.00, '{vegan,glutenFree}', 'assets/images/dish-dessert.svg', true, false, 6, 4.60, 88, 303),
  ('dr-01', 'drinks', 'Yirgacheffe Pour Over', 'Single-origin Ethiopian beans, hand poured, notes of jasmine and citrus.', 6.50, '{vegan,glutenFree}', 'assets/images/dish-drink.svg', true, false, 6, 4.90, 231, 401),
  ('dr-02', 'drinks', 'Hibiscus Spritz', 'Cold-steeped hibiscus, citrus, sparkling water. Zero alcohol.', 8.00, '{vegan,glutenFree}', 'assets/images/dish-drink.svg', true, false, 4, 4.70, 96, 402),
  ('dr-03', 'drinks', 'Barrel-Aged Old Fashioned', 'Bourbon rested in oak, bitters, orange oil, single ice sphere.', 14.00, '{}', 'assets/images/dish-drink.svg', true, false, 5, 4.80, 143, 403),
  ('dr-04', 'drinks', 'Fresh Mint Lemonade', 'Pressed lemons, garden mint, lightly sparkling, served long.', 7.00, '{vegan,glutenFree}', 'assets/images/dish-drink.svg', true, false, 4, 4.60, 74, 404)
on conflict (id) do nothing;

-- ===========================================================================
-- HARDENING NOTES — do these before a public launch
-- ---------------------------------------------------------------------------
-- 1. The `*_read` policies let anyone holding the anon key download every order
--    and reservation, including guest phone numbers. Once your staff sign in
--    with Supabase Auth, drop the anon grants, e.g.:
--
--      drop policy "orders_read" on public.orders;
--      create policy "orders_read_staff"
--        on public.orders for select
--        to authenticated
--        using (true);
--
--    and migrate admin.html to a real Supabase Auth session.
--
-- 2. Guest self-service lookups should go through an edge function that
--    requires the order `reference` instead of exposing table reads.
--
-- 3. Never place the service_role key in config.js. Use it only inside edge
--    functions / your own server, where you should also create the Stripe,
--    PayPal and Chapa sessions (see assets/js/payments.js).
--
-- 4. Rate-limit inserts (Supabase → Auth → Rate limits, or an edge function
--    with a KV counter) so the public order form cannot be spammed.
-- ===========================================================================
