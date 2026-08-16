"use client";

import { INPUT, Label } from "./fieldStyles";
import type { FieldComponentProps } from "./types";

interface DateValue {
  year: number;
  month: number;
  day: number;
  dayOfWeek: string;
  time: string;
  iso: string;
}

const DEFAULT_DATE: DateValue = { year: 2025, month: 1, day: 1, dayOfWeek: "", time: "", iso: "" };

export default function DateTimeField({ field, path, value, onChange }: FieldComponentProps) {
  const date = (value as DateValue | undefined) ?? DEFAULT_DATE;

  const setDatePart = (key: "year" | "month" | "day", val: number) => {
    const next = { ...date, [key]: val };
    onChange(`${path}.${key}`, val);
    onChange(
      `${path}.iso`,
      `${next.year}-${String(next.month).padStart(2, "0")}-${String(next.day).padStart(2, "0")}`
    );
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>{field.label}</Label>
        <div className="grid grid-cols-3 gap-2">
          <input className={INPUT} type="number" value={date.year} onChange={(e) => setDatePart("year", +e.target.value)} />
          <input className={INPUT} type="number" min={1} max={12} value={date.month} onChange={(e) => setDatePart("month", +e.target.value)} />
          <input className={INPUT} type="number" min={1} max={31} value={date.day} onChange={(e) => setDatePart("day", +e.target.value)} />
        </div>
        <div className="flex gap-1 mt-1">
          <p className="text-[10px] text-gray-400 w-1/3 text-center">연</p>
          <p className="text-[10px] text-gray-400 w-1/3 text-center">월</p>
          <p className="text-[10px] text-gray-400 w-1/3 text-center">일</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>요일</Label>
          <input className={INPUT} value={date.dayOfWeek} placeholder="토요일"
            onChange={(e) => onChange(`${path}.dayOfWeek`, e.target.value)} />
        </div>
        <div>
          <Label>시간</Label>
          <input className={INPUT} value={date.time} placeholder="오후 2시 30분"
            onChange={(e) => onChange(`${path}.time`, e.target.value)} />
        </div>
      </div>
    </div>
  );
}
