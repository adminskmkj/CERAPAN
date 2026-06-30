-- Langkah penambahbaikan per aspek (diisi guru yang dicerap)

alter table cerapan
  add column if not exists langkah_penambahbaikan jsonb not null default '{}';