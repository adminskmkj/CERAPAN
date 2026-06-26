-- CERAPAN Standard 4 PdP — Schema awal
-- Jalankan di Supabase SQL Editor

create type user_role as enum (
  'jpn_admin',
  'ppd_admin',
  'school_admin',
  'cerap_officer'
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('jpn', 'ppd')),
  ppd_code text,
  created_at timestamptz default now()
);

create table schools (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  kod_sekolah text not null unique,
  nama_sekolah text not null,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid references organizations(id),
  school_id uuid references schools(id),
  role user_role not null default 'cerap_officer',
  full_name text not null,
  created_at timestamptz default now()
);

create table cerapan (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  created_by uuid references profiles(id),
  kod_sekolah text not null,
  nama_sekolah text not null,
  nama_guru text not null,
  mata_pelajaran text not null,
  kelas text not null,
  sesi_pengisian text not null,
  tarikh date not null,
  kalendar_akademik text not null,
  nama_pemerhati text,
  jumlah_skor numeric(5,2) not null,
  taraf text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table cerapan_scores (
  id uuid primary key default gen_random_uuid(),
  cerapan_id uuid references cerapan(id) on delete cascade,
  item_id text not null,
  input_value int not null check (input_value between 1 and 5),
  score_value int not null check (score_value between 0 and 4),
  unique (cerapan_id, item_id)
);

alter table cerapan enable row level security;
alter table cerapan_scores enable row level security;
alter table profiles enable row level security;
alter table schools enable row level security;

-- RLS asas: pengguna hanya akses sekolah sendiri
create policy "profiles_read_own" on profiles
  for select using (auth.uid() = id);

create policy "cerapan_read_school" on cerapan
  for select using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and (p.role in ('jpn_admin', 'ppd_admin') or p.school_id = cerapan.school_id)
    )
  );

create policy "cerapan_insert_school" on cerapan
  for insert with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role in ('school_admin', 'cerap_officer', 'ppd_admin', 'jpn_admin')
    )
  );