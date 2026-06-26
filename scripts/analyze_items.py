import openpyxl
import re

path = r"C:\Users\user\Downloads\08-Tapak_Standard_4 PdP Updated 28.10.2024 (2) (1).xlsm"
wb = openpyxl.load_workbook(path, data_only=False, keep_vba=True)
ws = wb["STANDARD 4"]

sections = {
    "4.1.1": (36, 54),
    "4.2.1": (36, 54),
    "4.2.2": (59, 81),
    "4.3.1": (89, 116),
    "4.4.1": (124, 162),
    "4.4.2": (167, 189),
    "4.5.1": (197, 229),
    "4.6.1": (237, 280),
}

print("=== SUB-ITEMS (a, b, c...) per sub-standard ===")
for code, (start, end) in sections.items():
    items = []
    for r in range(start, end):
        v = ws.cell(r, 2).value
        if v and re.match(r"^[a-g]\)", str(v).strip()):
            items.append(str(v).replace("\n", " ")[:120])
    print(f"\n{code} ({len(items)} items):")
    for i, item in enumerate(items, 1):
        print(f"  {i}. {item}")

print("\n=== MUKA DEPAN workflow fields ===")
md = wb["MUKA DEPAN"]
fields = [
    (20, "KOD SEKOLAH"),
    (22, "NAMA SEKOLAH"),
    (24, "NAMA GURU"),
    (26, "MATA PELAJARAN"),
    (28, "KELAS"),
    (30, "SESI PENGISIAN"),
    (32, "TARIKH"),
]
for row, label in fields:
    print(f"  {label}: isi di G{row}")

print("\n=== GABUNG taraf formula ===")
print(wb["GABUNG"]["Z13"].value)