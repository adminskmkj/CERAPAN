/**
 * Reset kata laluan satu KP (tanpa e-mel recovery — elak ralat "email invalid").
 *
 * npm run reset-kp-password -- bm.skmkj@edu.my
 * npm run reset-kp-password -- bm.skmkj@edu.my KataLaluanBaru8
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

const KP_TEMP = "123456";
const emailArg = process.argv[2]?.trim().toLowerCase();
const passwordArg = process.argv[3]?.trim();

if (!emailArg || !emailArg.includes("@")) {
  console.error("Guna: npm run reset-kp-password -- bm.skmkj@edu.my [kata-laluan]");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!url || !serviceKey || serviceKey.includes("your-service")) {
  console.error("❌ Isi NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY dalam .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;

  const user = data.users.find((u) => u.email?.toLowerCase() === emailArg);
  if (!user) {
    console.error(`❌ Tiada user Auth dengan e-mel: ${emailArg}`);
    console.error("   Jalankan: npm run create-kp-users");
    process.exit(1);
  }

  const newPassword = passwordArg || KP_TEMP;
  const forceChange = !passwordArg || newPassword === KP_TEMP;

  const { error: updErr } = await admin.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true,
    user_metadata: {
      ...user.user_metadata,
      must_change_password: forceChange,
    },
  });

  if (updErr) throw updErr;

  console.log(`✅ Kata laluan dikemas kini: ${emailArg}`);
  console.log(`   User ID: ${user.id}`);
  if (forceChange) {
    console.log(`   Password sementara: ${KP_TEMP} (metadata must_change_password=true)`);
    console.log("   Log masuk → /tukar-kata-laluan");
  } else {
    console.log("   must_change_password=false (kata laluan khusus dari argumen)");
  }
}

main().catch((e) => {
  console.error("❌", e.message ?? e);
  process.exit(1);
});