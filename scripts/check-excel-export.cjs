// Run: node scripts/check-excel-export.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const JSZip = require("jszip");

const root = path.resolve(__dirname, "..");
const helperPath = path.join(root, "src/lib/export/standard4-excel.ts");
const templatePath = path.join(root, "public/templates/tapak-standard-4-template.xlsm");

assert.ok(fs.existsSync(helperPath), "Excel export helper must exist");
assert.ok(fs.existsSync(templatePath), "Official XLSM template must be bundled");

const source = fs.readFileSync(helperPath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const scoreMap = { 1: 4, 2: 3, 3: 2, 4: 1, 5: 0 };
const moduleBox = { exports: {} };
vm.runInNewContext(compiled, {
  module: moduleBox,
  exports: moduleBox.exports,
  require(name) {
    if (name === "jszip") return { __esModule: true, default: JSZip };
    if (name === "@/lib/scoring/standard4") {
      return { inputToSkor: (input) => scoreMap[input] };
    }
    return {};
  },
  console,
  Blob,
  URL,
});

const record = {
  id: "test-record",
  kodSekolah: "JBA1010",
  namaSekolah: "SK MOHD KHIR JOHARI",
  namaGuru: "NUR SABARIAH BINTI AHMAD",
  mataPelajaran: "BAHASA MELAYU",
  kelas: "4 AL-FARABI",
  sesiPengisian: "PENCERAPAN PERTAMA",
  tarikh: "2026-07-09",
  kalendarAkademik: "2026",
  scores: {
    "4.1.1-a": 1, "4.1.1-b": 2, "4.1.1-c": 3,
    "4.2.1-a": 4, "4.2.1-b": 5, "4.2.1-c": 1,
    "4.2.2-a": 2, "4.2.2-b": 3, "4.2.2-c": 4, "4.2.2-d": 5,
    "4.3.1-a": 1, "4.3.1-b": 1, "4.3.1-c": 2, "4.3.1-d": 2, "4.3.1-e": 3,
    "4.4.1-a": 1, "4.4.1-b": 2, "4.4.1-c": 3, "4.4.1-d": 4, "4.4.1-e": 5, "4.4.1-f": 1, "4.4.1-g": 2,
    "4.4.2-a": 1, "4.4.2-b": 2, "4.4.2-c": 3, "4.4.2-d": 4,
    "4.5.1-a": 5, "4.5.1-b": 4, "4.5.1-c": 3, "4.5.1-d": 2, "4.5.1-e": 1,
    "4.6.1-a": 1, "4.6.1-b": 2, "4.6.1-c": 3, "4.6.1-d": 4, "4.6.1-e": 5, "4.6.1-f": 1, "4.6.1-g": 2,
  },
  result: {
    subStandards: [
      { code: "4.1.1", weightedScore: 7.5, percentage: 75 },
      { code: "4.2.1", weightedScore: 5, percentage: 50 },
      { code: "4.2.2", weightedScore: 1.88, percentage: 37.5 },
      { code: "4.3.1", weightedScore: 12, percentage: 80 },
      { code: "4.4.1", weightedScore: 16.07, percentage: 64.29 },
      { code: "4.4.2", weightedScore: 3.13, percentage: 62.5 },
      { code: "4.5.1", weightedScore: 5, percentage: 50 },
      { code: "4.6.1", weightedScore: 12.86, percentage: 64.29 },
    ],
    jumlahSkor: 63.44,
    taraf: "SEDERHANA",
  },
};

function cellXml(xml, ref) {
  const m = xml.match(new RegExp(`<c\\b[^>]*\\br="${ref}"[^>]*(?:/>|>[\\s\\S]*?<\\/c>)`));
  assert.ok(m, `Cell ${ref} must exist`);
  return m[0];
}

function vmlChecked(xml, shapeId) {
  const m = xml.match(
    new RegExp(`<v:shape\\b[^>]*\\bid="_x0000_s${shapeId}"[\\s\\S]*?<x:ClientData\\s+ObjectType="Radio">([\\s\\S]*?)<\\/x:ClientData>`)
  );
  assert.ok(m, `Radio shape ${shapeId} must exist`);
  return /<x:Checked>1<\/x:Checked>/.test(m[1]);
}

(async () => {
  const sourceBytes = fs.readFileSync(templatePath);
  const output = await moduleBox.exports.buildStandard4Workbook(sourceBytes, record);
  const zip = await JSZip.loadAsync(output);
  assert.ok(zip.file("xl/vbaProject.bin"), "VBA project must be preserved");
  assert.ok(zip.file("xl/drawings/vmlDrawing1.vml"), "official controls/drawing must be preserved");

  const front = await zip.file("xl/worksheets/sheet1.xml").async("string");
  const standard = await zip.file("xl/worksheets/sheet2.xml").async("string");
  const combined = await zip.file("xl/worksheets/sheet3.xml").async("string");

  assert.match(cellXml(front, "G20"), /JBA1010/);
  assert.match(cellXml(front, "G24"), /NUR SABARIAH BINTI AHMAD/);
  assert.match(cellXml(front, "G32"), /09\/07\/2026/);
  assert.match(cellXml(standard, "T12"), /<v>1<\/v>/);
  assert.match(cellXml(standard, "T13"), /<v>2<\/v>/);
  assert.match(cellXml(standard, "T14"), /<v>3<\/v>/);
  assert.match(cellXml(standard, "U13"), /<v>3<\/v>/, "cached displayed score must match input 2 → score 3");
  assert.match(cellXml(standard, "AS19"), /<v>63\.44<\/v>/);
  // GABUNG: kekalkan formula asal — Excel kira sendiri semasa buka.
  assert.match(cellXml(combined, "D13"), /IF\(/);

  const workbook = await zip.file("xl/workbook.xml").async("string");
  assert.match(workbook, /fullCalcOnLoad="1"/);
  const vml = await zip.file("xl/drawings/vmlDrawing1.vml").async("string");
  // Fixture: 4.1.1-a = 1 → skor 4 (butang pertama); 4.2.2-a = 2 → skor 3
  // (butang kedua). 4.2.2-c = 4 → skor 1 (butang keempat).
  // Baris anchor: 4.1.1-a = 17, 4.2.2-a = 64, 4.2.2-c = 74.
  function rowChecked(row, col) {
    const re = new RegExp(
      `<x:Anchor>\\s*${col},\\s*0,\\s*${row},[\\s\\S]*?<x:Checked>([01])<\\/x:Checked>`
    );
    const block = vml.match(
      new RegExp(`<x:Anchor>\\s*${col},\\s*0,\\s*${row},[\\s\\S]*?<\\/v:shape>`)
    );
    assert.ok(block, `Radio row ${row} col ${col} must exist`);
    const m = block[0].match(/<x:Checked>([01])<\/x:Checked>/);
    return m ? m[1] === "1" : false;
  }
  // 4.1.1-a (skor 4): hanya lajur 4 terisi.
  assert.equal(rowChecked(17, 4), true, "4.1.1-a col 4 on");
  assert.equal(rowChecked(17, 6), false, "4.1.1-a col 3 off");
  // 4.2.2-a (skor 3): hanya lajur 3 terisi.
  assert.equal(rowChecked(64, 4), false, "4.2.2-a col 4 off");
  assert.equal(rowChecked(64, 6), true, "4.2.2-a col 3 on");
  // 4.2.2-c (skor 1): hanya lajur 1 terisi.
  assert.equal(rowChecked(74, 10), true, "4.2.2-c col 1 on");
  assert.equal(rowChecked(74, 4), false, "4.2.2-c col 4 off");
  assert.doesNotMatch(vml, /<x:FmlaLink>/, "radio buttons must not overwrite input cells");
  // Check the separate Excel control state, including the first radio after
  // every group box. VML alone can look correct while Excel still shows 4.
  const original = await JSZip.loadAsync(sourceBytes);
  const originalVml = await original.file("xl/drawings/vmlDrawing1.vml").async("string");
  const sheetRels = await zip.file("xl/worksheets/_rels/sheet2.xml.rels").async("string");
  const relationships = new Map();
  for (const tag of sheetRels.match(/<Relationship\b[^>]*\/>/g)) {
    relationships.set(tag.match(/\bId="([^"]+)"/)[1], tag.match(/\bTarget="([^"]+)"/)[1]);
  }
  const controls = new Map();
  for (const tag of standard.match(/<control\b[^>]*>/g)) {
    controls.set(tag.match(/\bshapeId="([^"]+)"/)[1], relationships.get(tag.match(/\br:id="([^"]+)"/)[1]));
  }
  const inputColumns = { T: "4.1.1", W: "4.2.1", Z: "4.2.2", AC: "4.3.1", AF: "4.4.1", AI: "4.4.2", AL: "4.5.1", AO: "4.6.1" };
  const checkedPerItem = new Map();
  let radioCount = 0;
  const itemByRow = new Map();
  for (const shape of originalVml.match(/<v:shape\b[\s\S]*?<\/v:shape>/g)) {
    if (!/ObjectType="Radio"/.test(shape)) continue;
    const link = shape.match(/<x:FmlaLink>\s*\$([A-Z]+)\$(\d+)\s*<\/x:FmlaLink>/);
    if (link) {
      const row = shape.match(/<x:Anchor>\s*\d+,\s*\d+,\s*(\d+),/)[1];
      itemByRow.set(row, `${inputColumns[link[1]]}-${String.fromCharCode(97 + Number(link[2]) - 12)}`);
    }
  }
  for (const shape of originalVml.match(/<v:shape\b[\s\S]*?<\/v:shape>/g)) {
    if (!/ObjectType="Radio"/.test(shape)) continue;
    const shapeId = shape.match(/\bid="_x0000_s(\d+)"/)[1];
    const anchor = shape.match(/<x:Anchor>\s*(\d+),/);
    const row = shape.match(/<x:Anchor>\s*\d+,\s*\d+,\s*(\d+),/)[1];
    const itemId = itemByRow.get(row);
    const expected = scoreMap[record.scores[itemId]] === ({ 4: 4, 6: 3, 8: 2, 10: 1, 12: 0 })[Number(anchor[1])];
    const propPath = `xl/${controls.get(shapeId).replace(/^\.\.\//, "")}`;
    const prop = await zip.file(propPath).async("string");
    assert.equal(/\bchecked="Checked"/.test(prop), expected, `${itemId} shape ${shapeId} control state`);
    assert.equal(vmlChecked(vml, shapeId), expected, `${itemId} shape ${shapeId} VML state`);
    assert.doesNotMatch(prop, /\bfmlaLink=/);
    checkedPerItem.set(itemId, (checkedPerItem.get(itemId) ?? 0) + Number(expected));
    radioCount++;
  }
  assert.equal(radioCount, 190);
  assert.equal(checkedPerItem.size, 38);
  for (const [item, count] of checkedPerItem) assert.equal(count, 1, `${item}: exactly one radio checked`);
  if (process.env.CERAPAN_TEST_OUTPUT) fs.writeFileSync(process.env.CERAPAN_TEST_OUTPUT, output);
  console.log("PASS Excel export: official layout, metadata, scores, result, macros and controls preserved");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
