-- Jalankan SEKALI dalam Supabase → SQL Editor (projek CERAPAN)
-- Selepas ini: npm run create-kp-users

-- 1) Peranan KP dalam enum
alter type user_role add value if not exists 'ketua_panitia';

-- 2) Kolum panitia (KP + cerapan)
alter table profiles add column if not exists panitia text;
alter table cerapan add column if not exists panitia_kp text;

create index if not exists cerapan_kp_panitia_idx
  on cerapan (nama_guru, sesi_pengisian, panitia_kp)
  where sesi_pengisian = 'PENCERAPAN KETUA PANITIA';