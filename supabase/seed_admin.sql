-- SEED PENTADBIR PERTAMA
-- 1. Cipta pengguna di Supabase Auth Dashboard (Authentication > Users > Add user)
-- 2. Salin UUID pengguna tersebut
-- 3. Ganti 'USER_UUID_HERE' di bawah dan jalankan SQL ini

-- insert into organizations (id, name, type, ppd_code)
-- values ('00000000-0000-0000-0000-000000000001', 'Organisasi Contoh', 'ppd', 'ORG01');

-- insert into profiles (id, full_name, role, org_id)
-- values (
--   'USER_UUID_HERE',
--   'Pentadbir Utama',
--   'ppd_admin',
--   '00000000-0000-0000-0000-000000000001'
-- );