-- BETULKAN: infinite recursion pada polisi profiles
-- Jalankan di Supabase SQL Editor

drop policy if exists "profiles_read_own" on profiles;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('jpn_admin', 'ppd_admin')
  );
$$;

-- Baca profil sendiri ATAU admin baca semua
create policy "profiles_read" on profiles
  for select using (auth.uid() = id or public.is_admin());

-- Admin boleh lihat senarai pengguna
grant execute on function public.is_admin() to authenticated;