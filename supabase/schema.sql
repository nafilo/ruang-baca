begin;

create table public.ruang_baca_books (
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null default gen_random_uuid()::text check (btrim(id) <> ''),
  title text not null check (char_length(btrim(title)) between 1 and 100),
  author text not null check (char_length(btrim(author)) between 1 and 80),
  genre text not null default 'Lainnya' check (char_length(btrim(genre)) between 1 and 40),
  year smallint check (year between 1 and 9999),
  description text not null default '' check (char_length(description) <= 240),
  cover smallint not null default 1 check (cover between 1 and 5),
  added_at timestamptz not null default now(),
  primary key (owner_id, id)
);

alter table public.ruang_baca_books enable row level security;

revoke all on table public.ruang_baca_books from public, anon, authenticated;
grant select, insert, update, delete on table public.ruang_baca_books to authenticated;

create policy "Owners can read books"
  on public.ruang_baca_books for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can add books"
  on public.ruang_baca_books for insert to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Owners can edit books"
  on public.ruang_baca_books for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete books"
  on public.ruang_baca_books for delete to authenticated
  using ((select auth.uid()) = owner_id);

commit;
