-- Add owner_id and owner_email to stores so each store is linked to one Google account
alter table public.stores
  add column if not exists owner_id uuid references auth.users (id) on delete cascade,
  add column if not exists owner_email text;

-- One store per owner (enforced on both id and email)
create unique index if not exists stores_owner_id_unique on public.stores (owner_id);
create unique index if not exists stores_owner_email_unique on public.stores (owner_email);

-- Owners can insert their own store
create policy "Store owners can create their store"
  on public.stores for insert
  with check (auth.uid () = owner_id);

-- Owners can update their own store
create policy "Store owners can update their store"
  on public.stores for update
  using (auth.uid () = owner_id)
  with check (auth.uid () = owner_id);
