-- SEED PENTADBIR PERTAMA — adminskmkj@gmail.com
-- 1. Supabase Dashboard → Authentication → Users → Add user
--    Email: adminskmkj@gmail.com
--    Password: (tetapkan kata laluan pentadbir)
--    Auto Confirm User: ON
-- 2. Salin UUID pengguna tersebut
-- 3. Ganti 'USER_UUID_HERE' di bawah dan jalankan SQL ini
-- 4. Auth → Providers → Email → matikan "Enable sign ups" (tiada pendaftaran awam)

-- insert into organizations (id, name, type, ppd_code)
-- values ('00000000-0000-0000-0000-000000000001', 'Organisasi Contoh', 'ppd', 'ORG01');

-- insert into profiles (id, full_name, role, org_id)
-- values (
--   'USER_UUID_HERE',
--   'Pentadbir Utama',
--   'ppd_admin',
--   '00000000-0000-0000-0000-000000000001'
-- );