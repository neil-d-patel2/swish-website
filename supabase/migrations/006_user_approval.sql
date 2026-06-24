-- Gate store creation behind manual owner approval.
-- A new Google user lands in 'pending' and cannot create a store until the
-- owner approves them from the /approvals page.

create table if not exists public.user_approvals (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'denied')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz
);

alter table public.user_approvals enable row level security;

-- A user can read their own approval row (to see pending/approved status).
drop policy if exists "Users can view their own approval" on public.user_approvals;
create policy "Users can view their own approval"
  on public.user_approvals for select
  using (auth.uid () = id);

-- A user can create their own approval request, but only as 'pending'.
drop policy if exists "Users can request their own approval" on public.user_approvals;
create policy "Users can request their own approval"
  on public.user_approvals for insert
  with check (auth.uid () = id and status = 'pending');

-- The owner/admin can see every approval request.
drop policy if exists "Admin can view all approvals" on public.user_approvals;
create policy "Admin can view all approvals"
  on public.user_approvals for select
  using ((auth.jwt () ->> 'email') = 'swishappdev@gmail.com');

-- The owner/admin can approve or deny.
drop policy if exists "Admin can decide approvals" on public.user_approvals;
create policy "Admin can decide approvals"
  on public.user_approvals for update
  using ((auth.jwt () ->> 'email') = 'swishappdev@gmail.com')
  with check ((auth.jwt () ->> 'email') = 'swishappdev@gmail.com');

-- Tighten store creation: only an approved owner (or the admin) may create a
-- store. Replaces the policy from 002_store_ownership.sql.
drop policy if exists "Store owners can create their store" on public.stores;
create policy "Store owners can create their store"
  on public.stores for insert
  with check (
    auth.uid () = owner_id
    and (
      (auth.jwt () ->> 'email') = 'swishappdev@gmail.com'
      or exists (
        select 1 from public.user_approvals ua
        where ua.id = auth.uid () and ua.status = 'approved'
      )
    )
  );
