-- POS integrations (Shopify + Square): connection metadata, locked-down
-- credentials, catalog provenance, and synced sales history.

-- Connection metadata is safe for the store owner to read (no secrets).
create table if not exists public.pos_connections (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  provider text not null check (provider in ('shopify', 'square')),
  status text not null default 'connected'
    check (status in ('connected', 'disconnected', 'error')),
  external_account text,
  last_synced_at timestamptz,
  last_sync_status text,
  last_sync_error text,
  connected_at timestamptz not null default now(),
  unique (store_id, provider)
);

alter table public.pos_connections enable row level security;

drop policy if exists "Store owners can view their pos connections" on public.pos_connections;
create policy "Store owners can view their pos connections"
  on public.pos_connections for select
  using (
    exists (
      select 1 from public.stores
      where stores.id = pos_connections.store_id
        and stores.owner_id = auth.uid ()
    )
  );

-- No insert/update/delete policy: only the Supabase service role (used from
-- Convex, same pattern as convex/stripe.ts) may write to this table.

-- OAuth tokens. RLS enabled with zero policies -> unreachable via the anon
-- or authenticated roles, only the service role can read/write.
create table if not exists public.pos_credentials (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  provider text not null check (provider in ('shopify', 'square')),
  access_token text not null,
  refresh_token text,
  token_expires_at timestamptz,
  scope text,
  raw jsonb,
  updated_at timestamptz not null default now(),
  unique (store_id, provider)
);

alter table public.pos_credentials enable row level security;

-- Track where an item came from so POS sync can safely upsert without
-- duplicating manually-added rows.
alter table public.items
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'shopify', 'square')),
  add column if not exists external_id text;

-- Not partial: PostgREST's on_conflict param can only target a plain unique
-- index (it can't pass a WHERE predicate through the API), so this can't be
-- `where external_id is not null` even though that's the "correct" intent.
-- A plain unique index still allows unlimited manual items with a NULL
-- external_id, since NULLs are never considered duplicates of each other.
create unique index if not exists items_store_provider_external_unique
  on public.items (store_id, source, external_id);

-- Synced order/line-item history.
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  item_id uuid references public.items (id) on delete set null,
  provider text not null check (provider in ('shopify', 'square')),
  external_order_id text not null,
  external_line_item_id text,
  item_name text,
  quantity integer not null default 1,
  unit_price numeric,
  total_price numeric,
  sold_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (store_id, provider, external_order_id, external_line_item_id)
);

alter table public.sales enable row level security;

drop policy if exists "Store owners can view their sales" on public.sales;
create policy "Store owners can view their sales"
  on public.sales for select
  using (
    exists (
      select 1 from public.stores
      where stores.id = sales.store_id
        and stores.owner_id = auth.uid ()
    )
  );

-- Per-owner toggle: whether manual notifications from the Swish team should
-- also be emailed (see 009_store_notifications.sql).
alter table public.stores
  add column if not exists notify_email boolean not null default true;
