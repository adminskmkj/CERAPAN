# CERAPAN — Standard 4 PdP

Aplikasi web pemantauan guru Standard 4 Pembelajaran dan Pemudahcaraan (PdPc) untuk JPN dan sekolah.

## Ciri

- Borang cerapan 3 langkah dengan auto-kira skor & taraf
- Dashboard statistik (taburan taraf, purata skor, mengikut sekolah)
- Laporan moden — cetak & muat turun PDF
- Log masuk Supabase (akaun e-mel baharu dicipta pentadbir)
- Panel pentadbir — cipta pengguna baharu
- Mod demo tanpa Supabase (localStorage)

## Mula Pantas

```bash
cd D:/apps/CERAPAN
npm install
npm run dev
```

Buka http://localhost:3000

## Setup Supabase (Production)

### 1. Cipta projek Supabase

1. https://supabase.com → New Project
2. Salin **Project URL**, **anon key**, **service_role key**

### 2. Jalankan migration

Di **SQL Editor**, jalankan secara berurutan:
- `supabase/migrations/001_initial.sql`
- `supabase/migrations/002_policies.sql`
- `supabase/migrations/005_ketua_panitia.sql` (peranan KP)
- `supabase/migrations/006_panitia_kp.sql` (panitia pada profil & rekod KP)

### 3. Konfigurasi env

```bash
cp .env.example .env.local
```

Isi:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 4. Cipta pentadbir pertama

1. Supabase Dashboard → **Authentication** → **Users** → **Add user**
2. Salin UUID pengguna
3. Jalankan `supabase/seed_admin.sql` (ganti USER_UUID_HERE)

### 5. Matikan pendaftaran awam

Authentication → Providers → Email → **Disable sign ups**

### 6. Akaun Ketua Panitia

Senarai rasmi panitia & KP: `src/lib/data/ketua-panitia-smkjs.ts`, `docs/akaun-ketua-panitia.md` (e-mel cadangan), dan `supabase/seed_ketua_panitia.sql`.

Untuk setiap KP: cipta user Auth → `insert` ke `profiles` dengan `role = ketua_panitia` dan `panitia` seperti jadual (contoh `BAHASA MELAYU`, `PJPK`, `SENI VISUAL`).

**Atau automatik (11 KP, password `123456`, wajib tukar):**

1. Pastikan migration `006_panitia_kp.sql` sudah dijalankan dalam SQL Editor.
2. `npm run create-kp-users`

## Halaman

| Laluan | Fungsi |
|--------|--------|
| `/` | Laman utama |
| `/log-masuk` | Log masuk |
| `/dashboard` | Statistik cerapan |
| `/cerapan/baharu` | Isi pencerapan (pentadbir P1/P2 & KP — satu borang markah) |
| `/cerapan/ketua-panitia` | Redirect ke `/cerapan/baharu` |
| `/rekod/laporan-individu` | Rekod mengikut guru & jenis laporan |
| `/senarai` | Senarai & carian rekod |
| `/cerapan/[id]/laporan` | Laporan PDF/cetak |

## Deploy Vercel (https://cerapan.vercel.app)

Projek ini sudah dipaut ke Vercel (`cerapan`). Cara paling mudah: **push ke GitHub** → Vercel build automatik.

### Repo

- GitHub: `https://github.com/adminskmkj/CERAPAN.git`
- Branch production biasanya `main`

### Env di Vercel (Settings → Environment Variables)

Sama seperti `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` *(Production + Preview; jangan expose ke client)*

### Supabase Auth (production)

Di Supabase → **Authentication** → **URL Configuration**:

- **Site URL**: `https://cerapan.vercel.app`
- **Redirect URLs**: tambah `https://cerapan.vercel.app/**`

### Push kod terkini

```bash
cd D:/apps/CERAPAN
git add -A
git status   # pastikan tiada .env.local
git commit -m "feat: KP, rekod jenis laporan, deploy siap"
git push origin main
```

Selepas push, semak **Vercel Dashboard → Deployments** (build `npm run build`).

### CLI (pilihan)

```bash
npm i -g vercel
vercel --prod
```

Tambah env variables yang sama di Vercel Dashboard.

## Julat Taraf

| Taraf | Skor (%) |
|-------|----------|
| CEMERLANG | 85 – 100 |
| BAIK | 70 – 84.99 |
| SEDERHANA | 55 – 69.99 |
| PERLU TINDAKAN SEGERA | 0 – 54.99 |