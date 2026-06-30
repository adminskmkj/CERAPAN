export type InputValue = 1 | 2 | 3 | 4 | 5;
export type Taraf = "CEMERLANG" | "BAIK" | "SEDERHANA" | "PERLU TINDAKAN SEGERA";

export interface ScoringItem {
  id: string;
  label: string;
}

export interface SubStandard {
  code: string;
  title: string;
  aspect: string;
  weight: number;
  maxScore: number;
  standardKualiti: string;
  tindakanUjud: string;
  items: ScoringItem[];
}

/** Teks penskoran ikut kolum Excel (4, 3, 2, 1, 0) */
export const PENSKORAN_KOLUM: Record<4 | 3 | 2 | 1 | 0, string> = {
  4: "i. mengikut pelbagai aras keupayaan murid\nii. mengikut peruntukan masa yang ditetapkan\niii. dengan mematuhi arahan yang berkuat kuasa/ketetapan kurikulum",
  3: "dengan mengambil kira perkara (i) dan (ii) atau perkara (i) dan (iii)",
  2: "dengan mengambil kira perkara (ii) dan (iii)",
  1: "dengan mengambil kira mana-mana satu (1) perkara",
  0: "tidak mengambil kira mana-mana perkara",
};

export const SKOR_TO_INPUT: Record<4 | 3 | 2 | 1 | 0, InputValue> = {
  4: 1,
  3: 2,
  2: 3,
  1: 4,
  0: 5,
};

export function inputToSkor(input: InputValue): 4 | 3 | 2 | 1 | 0 {
  return PENSKORAN_LABELS[input].skor as 4 | 3 | 2 | 1 | 0;
}

export const PENSKORAN_LABELS: Record<InputValue, { skor: number; label: string }> = {
  1: { skor: 4, label: "4 — Memenuhi semua kriteria (i, ii, iii)" },
  2: { skor: 3, label: "3 — Memenuhi (i)+(ii) atau (i)+(iii)" },
  3: { skor: 2, label: "2 — Memenuhi (ii)+(iii)" },
  4: { skor: 1, label: "1 — Memenuhi mana-mana satu kriteria" },
  5: { skor: 0, label: "0 — Tidak memenuhi mana-mana kriteria" },
};

export const TARAF_THRESHOLDS: { min: number; taraf: Taraf; color: string }[] = [
  { min: 85, taraf: "CEMERLANG", color: "taraf-cemerlang" },
  { min: 70, taraf: "BAIK", color: "taraf-baik" },
  { min: 55, taraf: "SEDERHANA", color: "taraf-sederhana" },
  { min: 0, taraf: "PERLU TINDAKAN SEGERA", color: "taraf-ptps" },
];

export const SUB_STANDARDS: SubStandard[] = [
  {
    code: "4.1.1",
    title: "Guru merancang pelaksanaan PdPc",
    aspect: "4.1 Guru sebagai Perancang",
    weight: 10,
    maxScore: 12,
    standardKualiti:
      "Guru merancang pelaksanaan PdPc secara profesional dan sistematik",
    tindakanUjud:
      "Menyediakan RPH, menentukan kaedah pentaksiran dan menyediakan sumber pendidikan mengikut keupayaan murid, peruntukan masa, dan mematuhi arahan yang berkuat kuasa/ketetapan kurikulum.",
    items: [
      { id: "4.1.1-a", label: "Guru merancang pelaksanaan PdP secara sistematik" },
      { id: "4.1.1-b", label: "Menyediakan RPH dengan objektif boleh ukur dan aktiviti sesuai" },
      { id: "4.1.1-c", label: "Menentukan kaedah pentaksiran yang sesuai" },
    ],
  },
  {
    code: "4.2.1",
    title: "Guru mengawal proses pembelajaran",
    aspect: "4.2 Guru sebagai Pengawal",
    weight: 10,
    maxScore: 12,
    standardKualiti: "Guru mengawal proses pembelajaran secara profesional dan terancang.",
    tindakanUjud: "Guru mengawal proses pembelajaran mengikut perancangan.",
    items: [
      { id: "4.2.1-a", label: "Mengelola isi pelajaran/skop pembelajaran yang dirancang" },
      { id: "4.2.1-b", label: "Mengelola masa PdPc selaras dengan aktiviti pembelajaran" },
      { id: "4.2.1-c", label: "Memberi peluang kepada penyertaan aktif murid" },
    ],
  },
  {
    code: "4.2.2",
    title: "Guru mengawal suasana pembelajaran",
    aspect: "4.2 Guru sebagai Pengawal",
    weight: 5,
    maxScore: 16,
    standardKualiti: "Guru mengawal suasana pembelajaran secara profesional dan terancang.",
    tindakanUjud: "Guru mengawal suasana pembelajaran mengikut perancangan.",
    items: [
      { id: "4.2.2-a", label: "Mengawasi komunikasi murid dalam PdPc" },
      { id: "4.2.2-b", label: "Mengawasi perlakuan murid dalam PdPc" },
      { id: "4.2.2-c", label: "Menyusun atur kedudukan murid" },
      { id: "4.2.2-d", label: "Melaksanakan aktiviti pembelajaran yang menyeronokkan" },
    ],
  },
  {
    code: "4.3.1",
    title: "Guru membimbing murid",
    aspect: "4.3 Guru sebagai Pembimbing",
    weight: 15,
    maxScore: 20,
    standardKualiti: "Guru membimbing murid secara profesional dan terancang.",
    tindakanUjud: "Guru membimbing murid menguasai pengetahuan, kemahiran dan nilai.",
    items: [
      { id: "4.3.1-a", label: "Memberi tunjuk ajar/panduan menguasai isi pelajaran/konsep" },
      { id: "4.3.1-b", label: "Memberi tunjuk ajar/panduan menguasai kemahiran dalam aktiviti" },
      { id: "4.3.1-c", label: "Memandu murid membuat keputusan dan menyelesaikan masalah" },
      { id: "4.3.1-d", label: "Memandu murid menggunakan sumber pendidikan berkaitan" },
      { id: "4.3.1-e", label: "Mengaitkan isi pelajaran dengan tema/nilai/kemahiran lain" },
    ],
  },
  {
    code: "4.4.1",
    title: "Guru mendorong minda murid",
    aspect: "4.4 Guru sebagai Pendorong",
    weight: 25,
    maxScore: 28,
    standardKualiti:
      "Guru mendorong minda murid dalam melaksanakan aktiviti pembelajaran secara profesional dan terancang.",
    tindakanUjud: "Guru mendorong minda murid dalam aktiviti pembelajaran.",
    items: [
      { id: "4.4.1-a", label: "Merangsang murid berkomunikasi" },
      { id: "4.4.1-b", label: "Merangsang murid berkolaboratif dalam aktiviti pembelajaran" },
      { id: "4.4.1-c", label: "Mengemukakan soalan ke arah pemikiran kritis dan kreatif" },
      { id: "4.4.1-d", label: "Mewujudkan situasi membuat keputusan dan menyelesaikan masalah" },
      { id: "4.4.1-e", label: "Mewujudkan peluang untuk murid memimpin" },
      { id: "4.4.1-f", label: "Menggalakkan murid mengemukakan soalan berkaitan isi pelajaran" },
      { id: "4.4.1-g", label: "Menggalakkan murid memperoleh pengetahuan secara kendiri" },
    ],
  },
  {
    code: "4.4.2",
    title: "Guru mendorong emosi murid",
    aspect: "4.4 Guru sebagai Pendorong",
    weight: 5,
    maxScore: 16,
    standardKualiti:
      "Guru mendorong emosi murid dalam melaksanakan aktiviti pembelajaran secara profesional dan terancang.",
    tindakanUjud: "Guru mendorong emosi murid dalam aktiviti pembelajaran.",
    items: [
      { id: "4.4.2-a", label: "Memberi pujian/galakan terhadap perlakuan positif" },
      { id: "4.4.2-b", label: "Memberi penghargaan terhadap hasil kerja/idea yang bernas" },
      { id: "4.4.2-c", label: "Memberi keyakinan dalam mengemukakan soalan/memberi respons" },
      { id: "4.4.2-d", label: "Prihatin terhadap keperluan murid" },
    ],
  },
  {
    code: "4.5.1",
    title: "Guru melaksanakan penilaian",
    aspect: "4.5 Guru sebagai Penilai",
    weight: 10,
    maxScore: 20,
    standardKualiti: "Guru melaksanakan penilaian secara sistematik dan terancang.",
    tindakanUjud: "Guru melaksanakan penilaian untuk mengesan tahap penguasaan murid.",
    items: [
      { id: "4.5.1-a", label: "Menggunakan pelbagai kaedah pentaksiran dalam PdPc" },
      { id: "4.5.1-b", label: "Menjalankan aktiviti pemulihan/pengayaan dalam PdPc" },
      { id: "4.5.1-c", label: "Memberi latihan/tugasan berkaitan pelajaran" },
      { id: "4.5.1-d", label: "Membuat refleksi PdPc" },
      { id: "4.5.1-e", label: "Menyemak/menilai hasil kerja/gerak kerja/latihan/tugasan" },
    ],
  },
  {
    code: "4.6.1",
    title: "Murid melibatkan diri dalam pembelajaran",
    aspect: "4.6 Murid sebagai Pembelajar Aktif",
    weight: 20,
    maxScore: 28,
    standardKualiti: "Murid melibatkan diri dalam proses pembelajaran secara berkesan.",
    tindakanUjud: "Murid melibatkan diri secara aktif dalam pembelajaran.",
    items: [
      { id: "4.6.1-a", label: "Memberi respons berkaitan isi pelajaran" },
      { id: "4.6.1-b", label: "Berkomunikasi dalam melaksanakan aktiviti pembelajaran" },
      { id: "4.6.1-c", label: "Melaksanakan aktiviti pembelajaran secara kolaboratif" },
      { id: "4.6.1-d", label: "Memberi respons ke arah pemikiran kritis dan kreatif" },
      { id: "4.6.1-e", label: "Mengemukakan soalan berkaitan isi pelajaran" },
      { id: "4.6.1-f", label: "Mengaitkan isi pelajaran dengan kehidupan/isu semasa" },
      { id: "4.6.1-g", label: "Membuat keputusan dan menyelesaikan masalah berkaitan aktiviti" },
    ],
  },
];

export function inputToScore(input: InputValue): number {
  return PENSKORAN_LABELS[input].skor;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function getTaraf(jumlahSkor: number): Taraf {
  for (const t of TARAF_THRESHOLDS) {
    if (jumlahSkor >= t.min) return t.taraf;
  }
  return "PERLU TINDAKAN SEGERA";
}

export function getTarafColor(taraf: Taraf): string {
  return TARAF_THRESHOLDS.find((t) => t.taraf === taraf)?.color ?? "taraf-ptps";
}

export interface SubStandardResult {
  code: string;
  title: string;
  aspect: string;
  weight: number;
  maxScore: number;
  sumScore: number;
  weightedScore: number;
  percentage: number;
  itemScores: { itemId: string; input: InputValue; score: number }[];
}

export interface CerapanResult {
  subStandards: SubStandardResult[];
  jumlahSkor: number;
  taraf: Taraf;
}

export function calculateCerapan(
  scores: Record<string, InputValue | undefined>
): CerapanResult {
  const subStandards: SubStandardResult[] = SUB_STANDARDS.map((sub) => {
    const itemScores = sub.items.map((item) => {
      const input = scores[item.id] ?? 1;
      return { itemId: item.id, input, score: inputToScore(input) };
    });
    const sumScore = itemScores.reduce((a, b) => a + b.score, 0);
    const weightedScore = round2((sumScore / sub.maxScore) * sub.weight);
    const percentage =
      sub.code === "4.4.2"
        ? Math.floor((sumScore / sub.maxScore) * 10000) / 100
        : round2((sumScore / sub.maxScore) * 100);

    return {
      code: sub.code,
      title: sub.title,
      aspect: sub.aspect,
      weight: sub.weight,
      maxScore: sub.maxScore,
      sumScore,
      weightedScore,
      percentage,
      itemScores,
    };
  });

  const jumlahSkor = round2(
    subStandards.reduce((a, b) => a + b.weightedScore, 0)
  );

  return { subStandards, jumlahSkor, taraf: getTaraf(jumlahSkor) };
}

export const SESI_PENGISIAN = [
  "KENDIRI",
  "PENCERAPAN PERTAMA",
  "PENCERAPAN KEDUA",
  "PENCERAPAN KETUA PANITIA",
] as const;

export type JenisCerapan = (typeof SESI_PENGISIAN)[number];

export const KALENDAR_AKADEMIK = ["2026", "2027", "2028"] as const;