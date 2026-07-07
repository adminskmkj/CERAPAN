import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

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

const TEST_PATTERNS = [
  /^__API_TEST_GURU__$/i,
  /^__PROD_TEST__$/i,
  /^DUP_LOCAL_TEST$/i,
  /^DUP_PROD_TEST2$/i,
  /^FK_TEST$/i,
];

const args = process.argv.slice(2);
const doDelete = args.includes("--delete");

const { data: all, error } = await sb
  .from("cerapan")
  .select(
    "id, nama_guru, mata_pelajaran, kelas, sesi_pengisian, jumlah_skor, taraf, created_at"
  )
  .order("created_at", { ascending: true });

if (error) {
  console.error(error);
  process.exit(1);
}

console.log("=== SEMUA REKOD (" + all.length + ") ===\n");
all.forEach((r, i) => {
  const isTest = TEST_PATTERNS.some((p) => p.test(r.nama_guru.trim()));
  console.log(
    `${i + 1}. [${isTest ? "TEST" : "REAL"}] ${r.id}`,
    "|",
    r.nama_guru,
    "|",
    r.mata_pelajaran,
    "|",
    r.kelas,
    "|",
    r.sesi_pengisian,
    "|",
    r.jumlah_skor,
    r.taraf
  );
});

const toDelete = all.filter((r) =>
  TEST_PATTERNS.some((p) => p.test(r.nama_guru.trim()))
);

console.log("\n=== REKOD UJIAN UNTUK PADAM (" + toDelete.length + ") ===");
for (const r of toDelete) {
  const { count } = await sb
    .from("cerapan_scores")
    .select("id", { count: "exact", head: true })
    .eq("cerapan_id", r.id);
  console.log(`- ${r.nama_guru} (${r.id}) scores: ${count ?? 0}`);
}

if (!doDelete) {
  console.log("\nJalankan dengan --delete untuk padam rekod ujian di atas.");
  process.exit(0);
}

for (const r of toDelete) {
  const { error: delErr } = await sb.from("cerapan").delete().eq("id", r.id);
  if (delErr) {
    console.error("GAGAL padam", r.id, delErr.message);
    process.exit(1);
  }
  console.log("DIPADAM:", r.nama_guru, r.id);
}

const { data: after } = await sb
  .from("cerapan")
  .select("id, nama_guru, sesi_pengisian, jumlah_skor, taraf")
  .order("created_at", { ascending: true });

console.log("\n=== SELEPAS PADAM (" + after.length + " rekod) ===");
after.forEach((r, i) =>
  console.log(
    `${i + 1}. ${r.nama_guru} | ${r.sesi_pengisian} | ${r.jumlah_skor} ${r.taraf}`
  )
);