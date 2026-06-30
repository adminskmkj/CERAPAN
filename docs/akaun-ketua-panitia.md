# Akaun log masuk Ketua Panitia (cadangan)

Setiap KP = **satu e-mel** dalam Supabase. Format sekolah:

**`{subjek}.skmkj@edu.my`**

Bahagian **`subjek`** tukar ikut mata pelajaran / panitia (bukan satu alamat `subjek@…` untuk semua).

| Panitia | Ketua Panitia | E-mel log masuk (cadangan) | `profiles.panitia` |
|---------|----------------|----------------------------|-------------------|
| BAHASA MELAYU | NURUL SHAFINA BINTI HAMEDI | `bm.skmkj@edu.my` | `BAHASA MELAYU` |
| BAHASA INGGERIS | CHRISTOPHER LIM TSE ZHERN | `bi.skmkj@edu.my` | `BAHASA INGGERIS` |
| MATEMATIK | SARINAH BINTI SHAWAL | `mate.skmkj@edu.my` | `MATEMATIK` |
| SAINS | LUTFI BIN ISNIN | `sains.skmkj@edu.my` | `SAINS` |
| PENDIDIKAN ISLAM | ABDUL RAHMAN BIN MOHAMED | `pi.skmkj@edu.my` | `PENDIDIKAN ISLAM` |
| BAHASA ARAB | ABDULLAH BIN MASTOR | `arab.skmkj@edu.my` | `BAHASA ARAB` |
| PJPK | ZAINAB BINTI ALI | `pjpk.skmkj@edu.my` | `PJPK` |
| MUZIK | MUHAMMAD AMIR ASYRAF BIN ROSLI | `muzik.skmkj@edu.my` | `MUZIK` |
| SEJARAH | MOHD RIDHWAN BIN HAJI OTHMAN | `sj.skmkj@edu.my` | `SEJARAH` |
| RBT | MOHAMAD HAIZAR BIN SUROR | `rbt.skmkj@edu.my` | `RBT` |
| SENI VISUAL | MUHAMMAD AKIF NASRIN BIN MOHAMAD NASIR | `psv.skmkj@edu.my` | `SENI VISUAL` |

Pentadbir sistem: `adminskmkj@gmail.com`.

## Kata laluan sementara KP (belum deploy Supabase)

- **Kata laluan pertama:** `123456` (rujuk `KP_TEMP_PASSWORD` dalam kod).
- **Wajib tukar** pada log masuk pertama → halaman `/tukar-kata-laluan`.
- Semasa **Add user** di Supabase (manual, bila sudah siap), set **User Metadata** JSON:

```json
{ "must_change_password": true }
```

App akan halang akses lain sehingga KP menukar kata laluan (minimum 8 aksara, tidak boleh kekal `123456`).

**Nota:** Tiada skrip auto-daftar user dijalankan dari repo — jangan push/deploy migration atau bulk-create user tanpa kelulusan pentadbir.

## Langkah pentadbir (bila sudah sedia Supabase)

1. Minta IT wujudkan e-mel ikut jadual (contoh `bm.skmkj@edu.my`).
2. Supabase → **Users** → Add user × 11: e-mel, kata laluan **`123456`**, metadata seperti atas.
3. `INSERT` profil — `supabase/seed_ketua_panitia.sql`.
4. **Disable sign ups**.

Kod: `emailCadanganKp()` dalam `src/lib/data/ketua-panitia-smkjs.ts`.