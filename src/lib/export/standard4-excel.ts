import JSZip from "jszip";
import type { CerapanRecord } from "@/lib/types/cerapan";
import { inputToSkor, type InputValue } from "@/lib/scoring/standard4";

const TEMPLATE_URL = "/templates/tapak-standard-4-template.xlsm";

const XML_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const SHEET_FRONT = "xl/worksheets/sheet1.xml";
const SHEET_STANDARD = "xl/worksheets/sheet2.xml";
const SHEET_COMBINED = "xl/worksheets/sheet3.xml";
const VML_CONTROLS = "xl/drawings/vmlDrawing1.vml";
const SHEET_STANDARD_RELS = "xl/worksheets/_rels/sheet2.xml.rels";

const FRONT_CELLS: Record<string, keyof Pick<
  CerapanRecord,
  | "kodSekolah"
  | "namaSekolah"
  | "namaGuru"
  | "mataPelajaran"
  | "kelas"
  | "sesiPengisian"
  | "tarikh"
  | "kalendarAkademik"
>> = {
  G20: "kodSekolah",
  G22: "namaSekolah",
  G24: "namaGuru",
  G26: "mataPelajaran",
  G28: "kelas",
  G30: "sesiPengisian",
  G32: "tarikh",
  I16: "kalendarAkademik",
};

const STANDARD_ITEM_CELLS: Record<string, string[]> = {
  "4.1.1": ["T12", "T13", "T14"],
  "4.2.1": ["W12", "W13", "W14"],
  "4.2.2": ["Z12", "Z13", "Z14", "Z15"],
  "4.3.1": ["AC12", "AC13", "AC14", "AC15", "AC16"],
  "4.4.1": ["AF12", "AF13", "AF14", "AF15", "AF16", "AF17", "AF18"],
  "4.4.2": ["AI12", "AI13", "AI14", "AI15"],
  "4.5.1": ["AL12", "AL13", "AL14", "AL15", "AL16"],
  "4.6.1": ["AO12", "AO13", "AO14", "AO15", "AO16", "AO17", "AO18"],
};

const STANDARD_SCORE_CELLS: Record<string, string[]> = {
  "4.1.1": ["U12", "U13", "U14"],
  "4.2.1": ["X12", "X13", "X14"],
  "4.2.2": ["AA12", "AA13", "AA14", "AA15"],
  "4.3.1": ["AD12", "AD13", "AD14", "AD15", "AD16"],
  "4.4.1": ["AG12", "AG13", "AG14", "AG15", "AG16", "AG17", "AG18"],
  "4.4.2": ["AJ12", "AJ13", "AJ14", "AJ15"],
  "4.5.1": ["AM12", "AM13", "AM14", "AM15", "AM16"],
  "4.6.1": ["AP12", "AP13", "AP14", "AP15", "AP16", "AP17", "AP18"],
};

const STANDARD_VALUE_CELLS: Record<string, string[]> = {
  "4.1.1": ["V12", "V13", "V14"],
  "4.2.1": ["Y12", "Y13", "Y14"],
  "4.2.2": ["AB12", "AB13", "AB14", "AB15"],
  "4.3.1": ["AE12", "AE13", "AE14", "AE15", "AE16"],
  "4.4.1": ["AH12", "AH13", "AH14", "AH15", "AH16", "AH17", "AH18"],
  "4.4.2": ["AK12", "AK13", "AK14", "AK15"],
  "4.5.1": ["AN12", "AN13", "AN14", "AN15", "AN16"],
  "4.6.1": ["AQ12", "AQ13", "AQ14", "AQ15", "AQ16", "AQ17", "AQ18"],
};

const STANDARD_RESULT_CELLS: Record<string, { weighted: string; percentage: string }> = {
  "4.1.1": { weighted: "V19", percentage: "V20" },
  "4.2.1": { weighted: "Y19", percentage: "Y20" },
  "4.2.2": { weighted: "AB19", percentage: "AB20" },
  "4.3.1": { weighted: "AE19", percentage: "AE20" },
  "4.4.1": { weighted: "AH19", percentage: "AH20" },
  "4.4.2": { weighted: "AK19", percentage: "AK20" },
  "4.5.1": { weighted: "AN19", percentage: "AN20" },
  "4.6.1": { weighted: "AQ19", percentage: "AQ20" },
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatExcelDate(raw: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : raw;
}

/**
 * Padanan satu sel tepat. Atribut mesti berhenti pada ">" atau "/>", jadi
 * `[^>]*` tak boleh melangkau ke sel jiran (itu punca fail rosak sebelum ini).
 */
function cellRegex(ref: string): RegExp {
  return new RegExp(`<c\\b((?:(?!/>)[^>])*?\\br="${ref}"(?:(?!/>)[^>])*)(?:/>|>([\\s\\S]*?)<\\/c>)`);
}

function replaceCell(
  xml: string,
  ref: string,
  value: string | number,
  type: "inline" | "number" = "inline",
  formula?: string
): string {
  const regex = cellRegex(ref);
  const match = regex.exec(xml);
  if (!match) throw new Error(`Sel ${ref} tiada dalam templat Excel.`);
  const inner = match[2] ?? "";

  const attrs = match[1].replace(/\/\s*$/, "").trimEnd();

  // PENTING: sel yang tiada formula sendiri (<c ...><v>x</v></c> atau sel
  // kosong) mungkin ahli shared-formula (t="shared") — formula induknya
  // berada di sel lain. JANGAN cipta atau padam tag <f> di sini; cuma
  // kemas kini nilai cache <v> dan Excel kira semula selebihnya.
  const existingFormula = /<f[\s>]/.test(inner);
  if (!formula && existingFormula) {
    return xml.replace(regex, (whole) =>
      /<v>[\s\S]*?<\/v>/.test(whole)
        ? whole.replace(/<v>[\s\S]*?<\/v>/, `<v>${escapeXml(String(value))}</v>`)
        : whole
    );
  }

  const innerFormula = existingFormula
    ? (/<f[\s\S]*?<\/f>/.exec(inner)?.[0] ?? "")
    : "";
  const formulaXml = formula ? `<f>${escapeXml(formula)}</f>` : innerFormula;

  if (type === "number") {
    // Kekalkan atribut t="str" jika asalnya ada (sel berformula teks).
    const hasStr = /\st="str"/.test(attrs);
    const attrsNum = hasStr
      ? attrs.replace(/\s+t="[^"]*"/g, ' t="str"')
      : attrs.replace(/\s+t="[^"]*"/g, "");
    return xml.replace(regex, `<c${attrsNum}>${formulaXml}<v>${Number(value)}</v></c>`);
  }

  const attrsText = attrs.replace(/\s+t="[^"]*"/g, "");
  return xml.replace(
    regex,
    `<c${attrsText} t="inlineStr">${formulaXml}<is><t xml:space="preserve">${escapeXml(String(value))}</t></is></c>`
  );
}

function replaceCellOptional(
  xml: string,
  ref: string,
  value: string | number,
  type: "inline" | "number" = "inline"
): string {
  return cellRegex(ref).test(xml) ? replaceCell(xml, ref, value, type) : xml;
}

function setWorkbookRecalculation(xml: string): string {
  if (/<calcPr\b/.test(xml)) {
    return xml.replace(
      /<calcPr\b[^>]*\/?>(?:<\/calcPr>)?/,
      '<calcPr calcId="191029" calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/>'
    );
  }
  return xml.replace(
    "</workbook>",
    '<calcPr calcId="191029" calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/></workbook>'
  );
}

function applyFrontSheet(xml: string, record: CerapanRecord): string {
  let next = xml;
  for (const [cell, key] of Object.entries(FRONT_CELLS)) {
    const raw = String(record[key] ?? "");
    const value = key === "tarikh" ? formatExcelDate(raw) : raw;
    next = replaceCell(next, cell, value);
  }
  return next;
}

function applyStandardSheet(xml: string, record: CerapanRecord): string {
  let next = xml;

  for (const [code, inputCells] of Object.entries(STANDARD_ITEM_CELLS)) {
    const scoreCells = STANDARD_SCORE_CELLS[code];
    const valueCells = STANDARD_VALUE_CELLS[code];
    inputCells.forEach((inputCell, index) => {
      const letter = String.fromCharCode(97 + index);
      const itemId = `${code}-${letter}`;
      const input = (record.scores[itemId] ?? 1) as InputValue;
      const score = inputToSkor(input);
      next = replaceCell(next, inputCell, input, "number");
      next = replaceCell(next, scoreCells[index], score, "number");
      next = replaceCell(next, valueCells[index], score, "number");
    });
  }

  for (const sub of record.result.subStandards) {
    const cells = STANDARD_RESULT_CELLS[sub.code];
    if (!cells) continue;
    next = replaceCell(next, cells.weighted, sub.weightedScore, "number");
    next = replaceCell(next, cells.percentage, sub.percentage, "number");
  }
  next = replaceCell(next, "AS19", record.result.jumlahSkor, "number");
  return next;
}

/**
 * GABUNG: semua sel berformula merujuk MUKA DEPAN & STANDARD 4.
 * Jangan tulis apa-apa — biar Excel kira sendiri semasa buka
 * (workbook diset fullCalcOnLoad).
 */
function applyCombinedSheet(xml: string, _record: CerapanRecord): string {
  return xml;
}

function clearTemplateErrorArtifacts(xml: string): string {
  // Templat asal mempunyai satu sel sisa #REF! pada muka depan (J62).
  return replaceCellOptional(xml, "J62", "");
}

/** Tukar rujukan sel "Z14" → "$Z$14" (format FmlaLink dalam VML). */
function toAbsoluteRef(cell: string): string {
  const match = /^([A-Z]+)(\d+)$/.exec(cell);
  return match ? `$${match[1]}$${match[2]}` : cell;
}

function recordInputs(record: CerapanRecord): Map<string, InputValue> {
  const inputs = new Map<string, InputValue>();
  for (const [code, inputCells] of Object.entries(STANDARD_ITEM_CELLS)) {
    inputCells.forEach((cell, index) => {
      const letter = String.fromCharCode(97 + index);
      inputs.set(
        toAbsoluteRef(cell),
        (record.scores[`${code}-${letter}`] ?? 1) as InputValue
      );
    });
  }
  return inputs;
}

/**
 * Peta baris (indeks 0-based dalam anchor VML) → rujukan sel input.
 * Setiap item ada 5 butang radio (skor 4,3,2,1,0) pada lajur anchor
 * 4, 6, 8, 10, 12.
 */
const RADIO_ROW_TO_INPUT: Record<number, string> = (() => {
  const map: Record<number, string> = {};
  const rows: Record<string, number[]> = {
    "4.1.1": [17, 22, 27],
    "4.2.1": [41, 46, 51],
    "4.2.2": [64, 69, 74, 79],
    "4.3.1": [94, 99, 104, 109, 114],
    "4.4.1": [129, 134, 139, 144, 149, 154, 159],
    "4.4.2": [172, 177, 182, 187],
    "4.5.1": [203, 209, 215, 221, 227],
    "4.6.1": [243, 249, 255, 261, 267, 273, 279],
  };
  for (const [code, itemRows] of Object.entries(rows)) {
    itemRows.forEach((row, index) => {
      const letter = String.fromCharCode(97 + index);
      map[row] = `${code}-${letter}`;
    });
  }
  return map;
})();

/** Lajur anchor → skor (4,3,2,1,0). */
const RADIO_COL_TO_SCORE: Record<number, number> = {
  4: 4,
  6: 3,
  8: 2,
  10: 1,
  12: 0,
};

function applyRadioSelection(
  zip: JSZip,
  record: CerapanRecord
): Promise<void> {
  return (async () => {
    const vmlFile = zip.file(VML_CONTROLS);
    const sheetFile = zip.file(SHEET_STANDARD);
    const relsFile = zip.file(SHEET_STANDARD_RELS);
    if (!vmlFile || !sheetFile || !relsFile) return;

    const [vml, sheetXml, relsXml] = await Promise.all([
      vmlFile.async("string"),
      sheetFile.async("string"),
      relsFile.async("string"),
    ]);
    const inputs = recordInputs(record);
    const checkedByShape = new Map<number, boolean>();

    const nextVml = vml.replace(
      // Stay inside one shape: otherwise a preceding group box supplies its
      // ID for the first radio, leaving that radio's ctrlProp at template score 4.
      /<v:shape\b[^>]*\bid="_x0000_s(\d+)"(?:(?!<\/v:shape>)[\s\S])*?<x:ClientData\s+ObjectType="Radio">([\s\S]*?)<\/x:ClientData>(?:(?!<\/v:shape>)[\s\S])*?<\/v:shape>/g,
      (shape, shapeIdText, clientData) => {
        const anchorMatch = /<x:Anchor>\s*(\d+),\s*\d+,\s*(\d+),/.exec(clientData);
        if (!anchorMatch) return shape;
        const col = Number(anchorMatch[1]);
        const row = Number(anchorMatch[2]);

        const itemId = RADIO_ROW_TO_INPUT[row];
        const scoreForColumn = RADIO_COL_TO_SCORE[col];
        if (!itemId || scoreForColumn === undefined) return shape;

        const linkMatch = /<x:FmlaLink>\s*(\$[A-Z]+\$\d+)\s*<\/x:FmlaLink>/.exec(clientData);
        const input = inputs.get(linkMatch?.[1] ?? "");
        const effectiveInput = input ?? (record.scores[itemId] ?? 1) as InputValue;
        const actualScore = inputToSkor(effectiveInput);
        const checked = actualScore === scoreForColumn;
        checkedByShape.set(Number(shapeIdText), checked);

        // Jadikan radio visual sahaja: buang pautan ke sel input supaya Excel
        // tidak menulis 0/1 lalu menimpa markah website ketika fail dibuka.
        let cleaned = clientData
          .replace(/<x:Checked>[01]<\/x:Checked>\s*/g, "")
          .replace(/<x:FmlaLink>[\s\S]*?<\/x:FmlaLink>\s*/g, "");
        if (checked) {
          // Susunan elemen ikut skema VML Excel: Checked mesti selepas
          // LockText (sebelum FmlaLink). Salah kedudukan → Excel abaikan.
          const tag = "<x:Checked>1</x:Checked>\n   ";
          if (/<x:LockText>[\s\S]*?<\/x:LockText>\s*/.test(cleaned)) {
            cleaned = cleaned.replace(
              /(<x:LockText>[\s\S]*?<\/x:LockText>\s*)/,
              `$1${tag}`
            );
          } else if (/<x:TextVAlign>[\s\S]*?<\/x:TextVAlign>\s*/.test(cleaned)) {
            cleaned = cleaned.replace(
              /(<x:TextVAlign>[\s\S]*?<\/x:TextVAlign>\s*)/,
              `$1${tag}`
            );
          } else {
            cleaned = cleaned.replace(
              /(<\/x:Anchor>\s*)/,
              `$1${tag}`
            );
          }
        }
        return shape.replace(clientData, cleaned);
      }
    );
    zip.file(VML_CONTROLS, nextVml);

    // Excel menentukan butang terpilih daripada ctrlProp `checked="Checked"`,
    // bukan VML. Jadi kita peta shape → ctrlProp dan set ikut data.
    const relToProp = new Map<string, string>();
    const relRe = /Id="(rId\d+)"[^>]*Target="\.\.\/ctrlProps\/(ctrlProp\d+)\.xml"/g;
    let relExec: RegExpExecArray | null = relRe.exec(relsXml);
    while (relExec) {
      relToProp.set(relExec[1], relExec[2]);
      relExec = relRe.exec(relsXml);
    }

    const shapeToProp = new Map<number, string>();
    const ctrlRe = /<control\s+shapeId="(\d+)"\s+r:id="(rId\d+)"/g;
    let ctrlExec: RegExpExecArray | null = ctrlRe.exec(sheetXml);
    while (ctrlExec) {
      const prop = relToProp.get(ctrlExec[2]);
      if (prop) shapeToProp.set(Number(ctrlExec[1]), prop);
      ctrlExec = ctrlRe.exec(sheetXml);
    }

    for (const [shapeId, checked] of checkedByShape) {
      const prop = shapeToProp.get(shapeId);
      if (!prop) continue;
      const path = `xl/ctrlProps/${prop}.xml`;
      const file = zip.file(path);
      if (!file) continue;
      const xml = await file.async("string");
      if (!/objectType="Radio"/.test(xml)) continue;
      const next = xml
        .replace(/\s+fmlaLink="[^"]*"/g, "")
        .replace(/\s+checked="Checked"/g, "")
        .replace(
          /(<formControlPr\b[^>]*?)(\s*\/>)/,
          checked ? '$1 checked="Checked"$2' : "$1$2"
        );
      zip.file(path, next);
    }

    // Pertahanan akhir: buang SEMUA fmlaLink radio, termasuk jika pemetaan
    // shape→ctrlProp gagal untuk mana-mana versi/persekitaran JS.
    const propPaths = Object.keys(zip.files).filter((path) =>
      /^xl\/ctrlProps\/ctrlProp\d+\.xml$/.test(path)
    );
    for (const path of propPaths) {
      const file = zip.file(path);
      if (!file) continue;
      const xml = await file.async("string");
      if (!/objectType="Radio"/.test(xml)) continue;
      zip.file(path, xml.replace(/\s+fmlaLink="[^"]*"/g, ""));
    }
  })();
}

export async function buildStandard4Workbook(
  template: ArrayBuffer | Uint8Array,
  record: CerapanRecord
): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(template);
  const front = zip.file(SHEET_FRONT);
  const standard = zip.file(SHEET_STANDARD);
  const combined = zip.file(SHEET_COMBINED);
  const workbook = zip.file("xl/workbook.xml");
  if (!front || !standard || !combined || !workbook) {
    throw new Error("Templat Excel Standard 4 tidak lengkap.");
  }

  zip.file(
    SHEET_FRONT,
    clearTemplateErrorArtifacts(
      applyFrontSheet(await front.async("string"), record)
    )
  );
  zip.file(SHEET_STANDARD, applyStandardSheet(await standard.async("string"), record));
  zip.file(SHEET_COMBINED, applyCombinedSheet(await combined.async("string"), record));
  zip.file("xl/workbook.xml", setWorkbookRecalculation(await workbook.async("string")));
  await applyRadioSelection(zip, record);

  return zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export async function downloadStandard4Excel(record: CerapanRecord): Promise<void> {
  const response = await fetch(TEMPLATE_URL, { cache: "force-cache" });
  if (!response.ok) throw new Error("Gagal memuatkan templat Excel Standard 4.");
  const output = await buildStandard4Workbook(await response.arrayBuffer(), record);
  const blob = new Blob([output as Uint8Array<ArrayBuffer>], {
    type: "application/vnd.ms-excel.sheet.macroEnabled.12",
  });
  const safeName = record.namaGuru
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Standard-4-${safeName || "Guru"}-${record.tarikh}.xlsm`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
