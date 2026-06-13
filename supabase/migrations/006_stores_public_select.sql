-- Allow anyone (signed in or not) to view the list of stores, so the public
-- "Stores" directory page can list every registered store.
drop policy if exists "Anyone can view stores" on public.stores;

create policy "Anyone can view stores"
  on public.stores for select
  using (true);
