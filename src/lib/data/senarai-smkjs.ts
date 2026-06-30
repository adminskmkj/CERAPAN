export interface StaffEntry {
  nama: string;
  jawatan?: string;
}

export type SesiGuru = "PAGI" | "PETANG";

export const SENARAI_PEMERHATI: StaffEntry[] = [
  { nama: "SITI ANITA BINTI MISRAN", jawatan: "GB" },
  { nama: "SYED ZAINAL ABIDIN BIN TUAN ZAKIR", jawatan: "GPK KURI" },
  { nama: "MOHD KHAIRISHAH RIZAL BIN MUHAMAD YAAKOB", jawatan: "GPK HEM" },
  { nama: "KHASNOR BINTI KAMDI", jawatan: "GPK KOKU" },
  { nama: "MOHD AMIR BIN AMZAH", jawatan: "GPK PTG" },
];

export const SENARAI_GURU_PAGI: StaffEntry[] = [
  { nama: "ABDUL RAHMAN BIN MOHAMED" },
  { nama: "AINAA NATASHA BINTI MOHD ZAIN", jawatan: "GBK" },
  { nama: "ALI ZAKARIA TABARI BIN MOHD NAWI" },
  { nama: "ARMIN HAIKAL BIN ZAHARI" },
  { nama: "CHRISTOPHER LIM TSE ZHERN" },
  { nama: "HABIBAH BINTI MOHAMAD" },
  { nama: "HANITA BINTI MOHD ALI @ JA'AFAR" },
  { nama: "HIDAYATUL FATIHAH BINTI BADRI HISHAM" },
  { nama: "ISMASURYANI BINTI SAID", jawatan: "GURU PRA" },
  { nama: "LUTFI BIN ISNIN" },
  { nama: "MIZAN ZALINA BINTI JAMIAN", jawatan: "GURU PRA" },
  { nama: "MOHAMAD HAIZAR BIN SUROR" },
  { nama: "MOHD RIDHWAN BIN HAJI OTHMAN" },
  { nama: "MUHAMMAD AKIF NASRIN BIN MOHAMAD NASIR" },
  { nama: "MUHAMMAD AMIR ASYRAF BIN ROSLI" },
  { nama: "MUHAMMAD ASYRAF BIN KAMARUDIN", jawatan: "GBK" },
  { nama: "NAJIHAH BINTI MANSOR", jawatan: "GURU PRA" },
  { nama: "NOR AQILAH BINTI ABDUL RAZAK" },
  { nama: "NOR AQLIRIANA BINTI RAMLI" },
  { nama: "NOR AZNIDA BINTI MOHD RIPIN" },
  { nama: "NOR FATIHAH BINTI MOHAMMED NAWI" },
  { nama: "NORAFARINA BINTI TAN" },
  { nama: "NORZAKIAH BINTI SAKDILAH" },
  { nama: "NUR SABARIAH BINTI AHMAD" },
  { nama: "NURFATEHA AZRIN" },
  { nama: "NURLYANA AQILAH BINTI MOHD TERFIZI" },
  { nama: "NURUL IZZAH BINTI MOHD MUHAIZI" },
  { nama: "NURUL SHAFINA BINTI HAMEDI" },
  { nama: "RAHMAT HIDAYAT BIN SABARI" },
  { nama: "ROSAFIZAWANI BINTI YUSOFF" },
  { nama: "ROZILA BINTI HASHIM" },
  { nama: "RUHIZAM NAZMIN BIN ALIAS" },
  { nama: "RYANOLD S.R ROSIDI" },
  { nama: "SALBIAH BINTI LIMAT" },
  { nama: "SALLWATI BINTI ABDULLAH" },
  { nama: "SARALAH A/P SELVARAJAH" },
  { nama: "SITI NORFATIN BINTI HAMZAH" },
  { nama: "SUMITRA A/P VARSAN" },
  { nama: "TAUFIK BIN MOHD HIDIR", jawatan: "GURU PRA" },
  { nama: "ZAHRI BIN ZABIR" },
  { nama: "ZAINAB BINTI ALI" },
  { nama: "ZAKARIA BIN HASHIM" },
];

export const SENARAI_GURU_PETANG: StaffEntry[] = [
  { nama: "ABDULLAH BIN MASTOR" },
  { nama: "ADIBAH BINTI OMAR" },
  { nama: "AINUN SOFIAH BT. ZAINAL" },
  { nama: "ASIAH BT MUNAJAM", jawatan: "GURU PRA" },
  { nama: "AZLIZA BINTI A ALLAH @ ABDULLAH" },
  { nama: "FAEZA BINTI HAMZAH" },
  { nama: "FAIZATI BINTI IMAM FAUZI" },
  { nama: "FATIMAH BINTI SALLEH" },
  { nama: "HAZMAN BIN MOHAMAD AMINI" },
  { nama: "MAHIRAH IZZATI BINTI MUHAMMAD SAFRI" },
  { nama: "MOHAMMAD NOR NAZMI BIN ABDUL RAZAK" },
  { nama: "MUHAMAD NURAZAM BIN RAHIM" },
  { nama: "MUHAMMAD YUSUF BIN M. NOH" },
  { nama: "MURSYIDA BINTI HANAFI @ MOHD GHANI" },
  { nama: "NOOR HAYATI BINTI ABD RAHMAN" },
  { nama: "NOR ISAH BINTI ABU HANIPAH" },
  { nama: "NORADILA BINTI ADNAN" },
  { nama: "NORFARAH ADILAH BINTI ROSLI" },
  { nama: "NUR AIN NAJMIAH BINTI ZAID" },
  { nama: "NUR AKALILI TASHA BINTI JAMIL" },
  { nama: "NUR ASYIQIN BINTI RASDI" },
  { nama: "NUR KHAIREEN AMEERAH BINTI ABD HALIM ALAM SHAH" },
  { nama: "NURUL IZZATI BINTI MOHD SUHAIMI" },
  { nama: "PUTRI NURFARAH YASMIN BINTI MOHD RAFAIZAN" },
  { nama: "RAFIDAH BINTI MD TAIB" },
  { nama: "RIHANA BINTI ABU TALIB" },
  { nama: "RODZIAH BTE MOHD SALLEH @ ZAKARIA" },
  { nama: "RUHAIZA BINTI OTHMAN", jawatan: "GURU PRA" },
  { nama: "SARINAH BINTI SHAWAL" },
  { nama: "SHAREETHAA A/P GAVERAN" },
  { nama: "SITI HALIYZA BT MOHD JUPRI" },
  { nama: "SITI NOR ZULAIKHA BINTI MOHAMAD ROZLAN" },
  { nama: "SITI NURAINI BT CHE MAT ZAIN@CHE HASAN" },
  { nama: "SITI ROHANA BINTI AWANG" },
];

export const SESI_GURU_OPTIONS: { value: SesiGuru; label: string }[] = [
  { value: "PAGI", label: "Sesi Pagi" },
  { value: "PETANG", label: "Sesi Petang" },
];

export function formatStaffLabel(entry: StaffEntry): string {
  return entry.jawatan ? `${entry.nama} — ${entry.jawatan}` : entry.nama;
}

/** Penyelia petang — pentadbir ini dalam senarai guru sesi petang sahaja */
export const PENTADBIR_SESI_PETANG = "MOHD AMIR BIN AMZAH";

export function getPentadbirDicergap(sesi: SesiGuru): StaffEntry[] {
  if (sesi === "PETANG") {
    return SENARAI_PEMERHATI.filter((p) => p.nama === PENTADBIR_SESI_PETANG);
  }
  return SENARAI_PEMERHATI.filter((p) => p.nama !== PENTADBIR_SESI_PETANG);
}

export function getDefaultGuruBySesi(sesi: SesiGuru): StaffEntry[] {
  const guru = sesi === "PAGI" ? SENARAI_GURU_PAGI : SENARAI_GURU_PETANG;
  const pentadbir = getPentadbirDicergap(sesi);
  const seen = new Set<string>();
  const merged: StaffEntry[] = [];

  for (const entry of [...pentadbir, ...guru]) {
    if (seen.has(entry.nama)) continue;
    seen.add(entry.nama);
    merged.push(entry);
  }

  return merged.sort((a, b) => a.nama.localeCompare(b.nama, "ms"));
}

export function getDefaultPemerhatiLabels(): string[] {
  return SENARAI_PEMERHATI.map(formatStaffLabel);
}

export function getDefaultGuruLabels(sesi: SesiGuru): string[] {
  return getDefaultGuruBySesi(sesi).map(formatStaffLabel);
}