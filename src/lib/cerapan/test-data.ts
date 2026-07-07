/** Nama guru ujian/debug — tidak dipaparkan dalam laporan atau simpanan pengguna. */
const TEST_NAMA_GURU_PATTERNS: RegExp[] = [
  /^__.*__$/, // __API_TEST_GURU__, __PROD_TEST__
  /^DUP_.*TEST\d*$/i,
  /^FK_TEST$/i,
];

export function isTestNamaGuru(nama: string): boolean {
  const trimmed = nama.trim();
  return TEST_NAMA_GURU_PATTERNS.some((p) => p.test(trimmed));
}

export function isTestCerapanRecord(record: {
  namaGuru: string;
}): boolean {
  return isTestNamaGuru(record.namaGuru);
}