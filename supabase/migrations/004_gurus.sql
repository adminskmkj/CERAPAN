-- Senarai guru per sekolah (cloud — untuk Vercel / multi-pengguna)

create table gurus (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete set null,
  kod_sekolah text not null,
  nama_sekolah text,
  nama_guru text not null,
  mata_pelajaran text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique (kod_sekolah, nama_guru)
);

create index gurus_kod_sekolah_idx on gurus (kod_sekolah);

alter table gurus enable row level security;

-- Baca: semua pengguna log masuk
create policy "gurus_read" on gurus
  for select using (auth.uid() is not null);

-- Tambah: pentadbir sekolah ke atas
create policy "gurus_insert" on gurus
  for insert with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role in ('jpn_admin', 'ppd_admin', 'school_admin', 'cerap_officer')
    )
  );

-- Padam: pentadbir sekolah & pentadbir utama
create policy "gurus_delete" on gurus
  for delete using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role in ('jpn_admin', 'ppd_admin', 'school_admin')
    )
  );