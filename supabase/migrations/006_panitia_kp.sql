-- Panitia KP pada profil + pada rekod pencerapan KP

alter table profiles add column if not exists panitia text;

alter table cerapan add column if not exists panitia_kp text;

create index if not exists cerapan_kp_panitia_idx
  on cerapan (nama_guru, sesi_pengisian, panitia_kp)
  where sesi_pengisian = 'PENCERAPAN KETUA PANITIA';