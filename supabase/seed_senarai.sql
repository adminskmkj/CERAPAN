-- Senarai pentadbir/pemerhati & guru SMKJS
-- Ganti KOD_SEKOLAH dengan kod sekolah sebenar sebelum jalankan.

-- Pentadbir disimpan sebagai guru dengan jawatan dalam mata_pelajaran (rujuk senarai-smkjs.ts)
-- Guru pagi & petang: jalankan skrip ini atau biarkan app guna senarai lalai dalam kod.

-- Contoh (ganti 'JEA0001' dengan kod sekolah anda):
/*
insert into gurus (kod_sekolah, nama_guru, mata_pelajaran) values
  ('JEA0001', 'SITI ANITA BINTI MISRAN', 'GB'),
  ('JEA0001', 'SYED ZAINAL ABIDIN BIN TUAN ZAKIR', 'GPK KURI'),
  ('JEA0001', 'MOHD KHAIRISHAH RIZAL BIN MUHAMAD YAAKOB', 'GPK HEM'),
  ('JEA0001', 'KHASNOR BINTI KAMDI', 'GPK KOKU'),
  ('JEA0001', 'MOHD AMIR BIN AMZAH', 'GPK PTG')
on conflict (kod_sekolah, nama_guru) do update set mata_pelajaran = excluded.mata_pelajaran;
*/

-- Senarai penuh guru pagi & petang ada dalam:
-- src/lib/data/senarai-smkjs.ts (dipaparkan automatik dalam dropdown borang)