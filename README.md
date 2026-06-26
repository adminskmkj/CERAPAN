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

## Halaman

| Laluan | Fungsi |
|--------|--------|
| `/` | Laman utama |
| `/log-masuk` | Log masuk |
| `/dashboard` | Statistik cerapan |
| `/cerapan/baharu` | Borang cerapan |
| `/senarai` | Senarai & carian rekod |
| `/cerapan/[id]/laporan` | Laporan PDF/cetak |
| `/pentadbir/pengguna` | Cipta akaun (admin sahaja) |

## Deploy Vercel

```bash
npm i -g vercel
vercel
```

Tambah env variables yang sama di Vercel Dashboard.

## Julat Taraf

| Taraf | Skor (%) |
|-------|----------|
| CEMERLANG | 85 – 100 |
| BAIK | 70 – 84.99 |
| SEDERHANA | 55 – 69.99 |
| PERLU TINDAKAN SEGERA | 0 – 54.99 |