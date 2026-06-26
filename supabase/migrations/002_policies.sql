-- Polisi tambahan & jadual sokongan

-- Benarkan pengguna baca profil sendiri + admin baca semua dalam org
drop policy if exists "profiles_read_own" on profiles;
create policy "profiles_read_own" on profiles
  for select using (
    auth.uid() = id
    or exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role in ('jpn_admin', 'ppd_admin')
    )
  );

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- Cerapan: kemas kini & padam
create policy "cerapan_update" on cerapan
  for update using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and (p.role in ('jpn_admin', 'ppd_admin') or p.school_id = cerapan.school_id)
    )
  );

create policy "cerapan_delete" on cerapan
  for delete using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role in ('jpn_admin', 'ppd_admin', 'school_admin')
    )
  );

-- Skor cerapan
alter table cerapan_scores enable row level security;

create policy "scores_read" on cerapan_scores
  for select using (
    exists (
      select 1 from cerapan c
      join profiles p on p.id = auth.uid()
      where c.id = cerapan_scores.cerapan_id
      and (p.role in ('jpn_admin', 'ppd_admin') or p.school_id = c.school_id)
    )
  );

create policy "scores_insert" on cerapan_scores
  for insert with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role in ('school_admin', 'cerap_officer', 'ppd_admin', 'jpn_admin')
    )
  );

create policy "scores_delete" on cerapan_scores
  for delete using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role in ('school_admin', 'cerap_officer', 'ppd_admin', 'jpn_admin')
    )
  );

-- Sekolah: baca untuk semua pengguna log masuk
create policy "schools_read" on schools
  for select using (auth.uid() is not null);

-- Data contoh (opsyenal — padam jika tidak perlu)
-- insert into organizations (name, type, ppd_code) values ('Organisasi Contoh', 'ppd', 'ORG01');