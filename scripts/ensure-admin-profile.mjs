/**
 * Pastikan akaun pentadbir utama (adminskmkj@gmail.com) ada dalam jadual profiles.
 * Tanpa ini, simpan Pencerapan 1/2 oleh pentadbir gagal (FK created_by).
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "adminskmkj@gmail.com";

const root = path.resolve(import.meta.dirname, "..");
for (const f of [".env.local", ".env"]) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data: users, error: listErr } = await sb.auth.admin.listUsers({
  perPage: 200,
});
if (listErr) {
  console.error("Gagal senarai user:", listErr.message);
  process.exit(1);
}

const admin = users.users.find(
  (u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
);
if (!admin) {
  console.error(`User ${ADMIN_EMAIL} tidak dijumpai dalam Auth.`);
  process.exit(1);
}

const { data: existing } = await sb
  .from("profiles")
  .select("id, role, full_name")
  .eq("id", admin.id)
  .maybeSingle();

if (existing) {
  console.log("Profil pentadbir sudah wujud:", existing.full_name, existing.role);
  process.exit(0);
}

const { error } = await sb.from("profiles").insert({
  id: admin.id,
  full_name: "Pentadbir Utama",
  role: "school_admin",
});

if (error) {
  console.error("Gagal cipta profil:", error.message);
  process.exit(1);
}

console.log("Profil pentadbir dicipta untuk", admin.id);