-- Add store_email directly on items so items can be scoped to a Google OAuth account
-- without needing a join through stores.
alter table public.items
  add column if not exists store_email text;

-- Back-fill existing items from their parent store's owner_email
update public.items i
set store_email = s.owner_email
from public.stores s
where s.id = i.store_id;

-- Drop and recreate RLS select policy to allow filtering by store_email
drop policy if exists "Anyone can view items" on public.items;

create policy "Anyone can view items"
  on public.items for select
  using (true);
