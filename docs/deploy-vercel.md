# Deploy Vercel — CERAPAN

**Production:** https://cerapan.vercel.app/

## Aliran

1. Kod di `main` → GitHub `adminskmkj/CERAPAN`
2. Vercel projek `cerapan` auto-deploy bila push (jika Git integration aktif)

## Env wajib (Vercel)

| Variable | Keterangan |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL projek Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server API sahaja |

## Supabase

- Migration SQL **tidak** dijalankan oleh Vercel — jalankan manual di SQL Editor (ikut kelulusan sekolah).
- Auth redirect: `https://cerapan.vercel.app` dan `https://cerapan.vercel.app/**`

## Semak deploy

- Vercel → Deployments → log build
- Lokal: `npm run build` mesti lulus sebelum push