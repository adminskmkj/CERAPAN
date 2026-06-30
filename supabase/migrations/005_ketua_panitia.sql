-- Peranan Ketua Panitia + jenis pencerapan KP
-- Selepas migration: cipta user di Auth, kemudian:
-- insert into profiles (id, full_name, role)
-- values ('<USER_UUID>', 'Nama KP', 'ketua_panitia');

alter type user_role add value if not exists 'ketua_panitia';