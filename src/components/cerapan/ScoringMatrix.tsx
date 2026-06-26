"use client";

import { Fragment } from "react";
import {
  PENSKORAN_KOLUM,
  SKOR_TO_INPUT,
  SUB_STANDARDS,
  inputToSkor,
  type InputValue,
} from "@/lib/scoring/standard4";
import { cn } from "@/lib/utils";

const SKOR_COLS = [4, 3, 2, 1, 0] as const;

interface Props {
  scores: Record<string, InputValue | undefined>;
  onChange: (itemId: string, value: InputValue) => void;
}

export function ScoringMatrix({ scores, onChange }: Props) {
  return (
    <div className="space-y-8">
      {SUB_STANDARDS.map((sub) => (
        <section key={sub.code} className="excel-rubric overflow-x-auto">
          <div className="excel-rubric-title">{sub.code}</div>

          <table className="excel-rubric-meta w-full border-collapse text-xs">
            <tbody>
              <tr>
                <td className="excel-cell-header w-[22%]">STANDARD KUALITI</td>
                <td className="excel-cell-header">TINDAKAN UNTUK MENCAPAI STANDARD</td>
              </tr>
              <tr>
                <td className="excel-cell-body align-top">{sub.standardKualiti}</td>
                <td className="excel-cell-body align-top">{sub.tindakanUjud}</td>
              </tr>
            </tbody>
          </table>

          <table className="excel-rubric-table mt-0 w-full min-w-[720px] border-collapse text-[11px]">
            <thead>
              <tr>
                <th className="excel-th w-[28%]" rowSpan={2}>
                  TINDAKAN
                </th>
                <th className="excel-th" colSpan={5}>
                  PENSKORAN
                </th>
              </tr>
              <tr>
                {SKOR_COLS.map((s) => (
                  <th key={s} className="excel-th w-[14%]">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sub.items.map((item, idx) => {
                const selected = inputToSkor(scores[item.id] ?? 1);
                return (
                  <Fragment key={item.id}>
                    <tr>
                      <td className="excel-td-tindakan align-top" rowSpan={2}>
                        <span className="font-semibold">
                          {String.fromCharCode(97 + idx)})
                        </span>{" "}
                        {item.label}
                      </td>
                      {SKOR_COLS.map((skor) => (
                        <td key={`${item.id}-desc-${skor}`} className="excel-td-desc align-top">
                          {PENSKORAN_KOLUM[skor].split("\n").map((line, i) => (
                            <span key={i} className="block">
                              {line}
                            </span>
                          ))}
                        </td>
                      ))}
                    </tr>
                    <tr className="excel-skor-row">
                      {SKOR_COLS.map((skor) => {
                        const isSelected = selected === skor;
                        return (
                          <td key={`${item.id}-pick-${skor}`} className="excel-td-skor">
                            <label className="excel-radio-label">
                              <input
                                type="radio"
                                name={`skor-${item.id}`}
                                checked={isSelected}
                                onChange={() => onChange(item.id, SKOR_TO_INPUT[skor])}
                                className="excel-radio"
                              />
                              <span
                                className={cn(
                                  "excel-radio-mark",
                                  isSelected && "excel-radio-mark--on"
                                )}
                              >
                                {isSelected ? "●" : "○"}
                              </span>
                            </label>
                          </td>
                        );
                      })}
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>

          <p className="excel-rubric-foot">
            {sub.aspect} · Wajaran {sub.weight}%
          </p>
        </section>
      ))}
    </div>
  );
}