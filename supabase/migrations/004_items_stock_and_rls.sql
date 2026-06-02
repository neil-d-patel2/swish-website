-- Add stock column to items
alter table public.items
  add column if not exists stock integer not null default 0;

-- Store owners can insert items into their own store
create policy "Store owners can insert items"
  on public.items for insert
  with check (
    exists (
      select 1 from public.stores
      where stores.id = items.store_id
        and stores.owner_id = auth.uid ()
    )
  );

-- Store owners can update items in their own store
create policy "Store owners can update items"
  on public.items for update
  using (
    exists (
      select 1 from public.stores
      where stores.id = items.store_id
        and stores.owner_id = auth.uid ()
    )
  );

-- Store owners can delete items in their own store
create policy "Store owners can delete items"
  on public.items for delete
  using (
    exists (
      select 1 from public.stores
      where stores.id = items.store_id
        and stores.owner_id = auth.uid ()
    )
  );
