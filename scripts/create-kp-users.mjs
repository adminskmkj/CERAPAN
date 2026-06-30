/**
 * Cipta / kemas kini 11 akaun Ketua Panitia dalam Supabase Auth + profiles.
 *
 * Keperluan dalam .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Jalankan: npm run create-kp-users
 * (Bukan "deploy migration" — hanya cipta user di projek Supabase sedia ada.)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const KP_TEMP_PASSWORD = "123456";

const ENTRIES = [
  { panitia: "BAHASA MELAYU", nama: "NURUL SHAFINA BINTI HAMEDI", email: "bm.skmkj@edu.my" },
  { panitia: "BAHASA INGGERIS", nama: "CHRISTOPHER LIM TSE ZHERN", email: "bi.skmkj@edu.my" },
  { panitia: "MATEMATIK", nama: "SARINAH BINTI SHAWAL", email: "mate.skmkj@edu.my" },
  { panitia: "SAINS", nama: "LUTFI BIN ISNIN", email: "sains.skmkj@edu.my" },
  { panitia: "PENDIDIKAN ISLAM", nama: "ABDUL RAHMAN BIN MOHAMED", email: "pi.skmkj@edu.my" },
  { panitia: "BAHASA ARAB", nama: "ABDULLAH BIN MASTOR", email: "arab.skmkj@edu.my" },
  { panitia: "PJPK", nama: "ZAINAB BINTI ALI", email: "pjpk.skmkj@edu.my" },
  { panitia: "MUZIK", nama: "MUHAMMAD AMIR ASYRAF BIN ROSLI", email: "muzik.skmkj@edu.my" },
  { panitia: "SEJARAH", nama: "MOHD RIDHWAN BIN HAJI OTHMAN", email: "sj.skmkj@edu.my" },
  { panitia: "RBT", nama: "MOHAMAD HAIZAR BIN SUROR", email: "rbt.skmkj@edu.my" },
  {
    panitia: "SENI VISUAL",
    nama: "MUHAMMAD AKIF NASRIN BIN MOHAMAD NASIR",
    email: "psv.skmkj@edu.my",
  },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!url || !serviceKey || serviceKey.includes("your-service")) {
  console.error(
    "❌ Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY dalam .env.local"
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserIdByEmail(email) {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const hit = data.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  return hit?.id ?? null;
}

async function ensureKp(entry) {
  const email = entry.email.toLowerCase();
  let userId = await findUserIdByEmail(email);

  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: KP_TEMP_PASSWORD,
      email_confirm: true,
      user_metadata: { must_change_password: true },
    });
    if (error) throw new Error(`${email}: createUser — ${error.message}`);
    userId = data.user.id;
    console.log(`✅ Cipta Auth: ${email}`);
  } else {
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: KP_TEMP_PASSWORD,
      user_metadata: { must_change_password: true },
    });
    if (error) throw new Error(`${email}: updateUser — ${error.message}`);
    console.log(`🔄 Kemas kini Auth (123456 + wajib tukar): ${email}`);
  }

  const { error: profileErr } = await admin.from("profiles").upsert(
    {
      id: userId,
      full_name: entry.nama,
      role: "ketua_panitia",
      panitia: entry.panitia,
    },
    { onConflict: "id" }
  );

  if (profileErr) {
    if (profileErr.message.includes("panitia")) {
      console.error(
        "\n⚠️  Kolum `profiles.panitia` belum wujud. Jalankan: supabase/setup_kp_once.sql\n"
      );
    }
    if (profileErr.message.includes("ketua_panitia")) {
      console.error(
        "\n⚠️  Enum `user_role` belum ada nilai ketua_panitia. Jalankan: supabase/setup_kp_once.sql\n"
      );
    }
    throw new Error(`${email}: profiles — ${profileErr.message}`);
  }
  console.log(`   profiles OK — ${entry.panitia}`);
}

async function main() {
  console.log(`Projek: ${url}`);
  console.log(`Kata laluan sementara: ${KP_TEMP_PASSWORD}\n`);

  for (const entry of ENTRIES) {
    await ensureKp(entry);
  }

  console.log("\n✅ Selesai — 11 KP. Log masuk app → wajib /tukar-kata-laluan.");
}

main().catch((e) => {
  console.error("❌", e.message ?? e);
  process.exit(1);
});