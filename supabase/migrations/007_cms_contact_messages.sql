create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  category text not null default '',
  message text not null,
  status text not null default 'unread',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_status_idx on public.contact_messages (status);

create trigger set_contact_messages_updated_at
  before update on public.contact_messages
  for each row execute function public.set_updated_at();

alter table public.contact_messages enable row level security;

create policy "Anyone can submit contact message"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

create policy "CMS admins can read contact messages"
  on public.contact_messages
  for select
  to authenticated
  using (public.is_cms_admin());

create policy "CMS admins can update contact messages"
  on public.contact_messages
  for update
  to authenticated
  using (public.is_cms_admin())
  with check (public.is_cms_admin());

create policy "CMS admins can delete contact messages"
  on public.contact_messages
  for delete
  to authenticated
  using (public.is_cms_admin());
