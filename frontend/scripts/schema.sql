-- Church Voice schema
-- Run via scripts/migrate.mjs against DATABASE_URL

create extension if not exists pgcrypto;

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  author text not null default '',
  description text not null default '',
  language text not null default 'en',
  narrator text not null default '',
  cover_color text not null default 'from-blue-900 to-indigo-800',
  created_at timestamptz not null default now()
);

create table if not exists chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  number int not null,
  title text not null,
  unique (book_id, number)
);

create table if not exists verses (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  number int not null,
  text text not null,
  unique (chapter_id, number)
);

create table if not exists recordings (
  id uuid primary key default gen_random_uuid(),
  verse_id uuid not null unique references verses(id) on delete cascade,
  storage_path text not null,
  duration_seconds numeric not null default 0,
  file_size bigint not null default 0,
  mime_type text not null default 'audio/webm',
  recorded_at timestamptz not null default now()
);

-- Aggregate progress per book (chapters / verses / recorded verses)
create or replace view book_progress as
select
  b.id as book_id,
  count(distinct c.id) as total_chapters,
  count(v.id) as total_verses,
  count(r.id) as recorded_verses
from books b
left join chapters c on c.book_id = b.id
left join verses v on v.chapter_id = c.id
left join recordings r on r.verse_id = v.id
group by b.id;

-- Public read access (writes happen server-side via the service role key, which bypasses RLS)
alter table books enable row level security;
alter table chapters enable row level security;
alter table verses enable row level security;
alter table recordings enable row level security;

drop policy if exists "public read" on books;
drop policy if exists "public read" on chapters;
drop policy if exists "public read" on verses;
drop policy if exists "public read" on recordings;

create policy "public read" on books for select using (true);
create policy "public read" on chapters for select using (true);
create policy "public read" on verses for select using (true);
create policy "public read" on recordings for select using (true);

grant usage on schema public to anon, authenticated;
grant select on books, chapters, verses, recordings, book_progress to anon, authenticated;
