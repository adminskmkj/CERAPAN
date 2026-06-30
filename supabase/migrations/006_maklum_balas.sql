-- Borang Maklum Balas Pencerapan — ulasan & dapatan per aspek

alter table cerapan
  add column if not exists dapatan_pencerap jsonb not null default '{}',
  add column if not exists ulasan_pencerapan text,
  add column if not exists tarikh_tindak_lanjut date;