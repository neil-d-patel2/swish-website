-- Manual notifications/recommendations pushed to a store by the Swish team
-- (swishappdev@gmail.com) from the /approvals admin tool.

create table if not exists public.store_notifications (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  type text not null default 'general'
    check (
      type in (
        'recommendation',
        'high_intent_item',
        'high_intent_customer',
        'stocking_idea',
        'marketing',
        'general'
      )
    ),
  title text not null,
  body text not null,
  cta_label text,
  cta_url text,
  read_at timestamptz,
  emailed_at timestamptz,
  created_at timestamptz not null default now(),
  created_by text not null default 'swishappdev@gmail.com'
);

alter table public.store_notifications enable row level security;

drop policy if exists "Store owners can view their notifications" on public.store_notifications;
create policy "Store owners can view their notifications"
  on public.store_notifications for select
  using (
    exists (
      select 1 from public.stores
      where stores.id = store_notifications.store_id
        and stores.owner_id = auth.uid ()
    )
  );

-- Owners can mark their own notifications read.
drop policy if exists "Store owners can update their notifications" on public.store_notifications;
create policy "Store owners can update their notifications"
  on public.store_notifications for update
  using (
    exists (
      select 1 from public.stores
      where stores.id = store_notifications.store_id
        and stores.owner_id = auth.uid ()
    )
  )
  with check (
    exists (
      select 1 from public.stores
      where stores.id = store_notifications.store_id
        and stores.owner_id = auth.uid ()
    )
  );

-- No insert policy: only the Supabase service role (used from the
-- storeNotifications.send Convex action) may create notifications.
