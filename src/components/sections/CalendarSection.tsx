"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWedding } from "@/context/WeddingContext";

function getDDay(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const wedding = new Date(iso);
  wedding.setHours(0, 0, 0, 0);
  const diff = Math.ceil((wedding.getTime() - today.getTime()) / 86400000);
  if (diff > 0) return `D - ${diff}`;
  if (diff === 0) return "D - DAY";
  return `D + ${Math.abs(diff)}`;
}

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarSection() {
  const wedding = useWedding();
  const [dday, setDday] = useState("");
  const { year, month, day } = wedding.date;
  const cells = buildCalendar(year, month);

  useEffect(() => {
    setDday(getDDay(wedding.date.iso));
  }, [wedding.date.iso]);

  return (
    <section className="py-20 px-6 bg-[var(--color-cream)]">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-xs tracking-[0.3em] text-[var(--color-warm-gray)] mb-2">DATE</p>
        <div className="section-divider mb-8" />

        <p className="font-serif text-2xl text-[var(--color-text)] tracking-widest mb-1">
          {year}.{String(month).padStart(2, "0")}.{String(day).padStart(2, "0")}
        </p>
        <p className="text-sm text-[var(--color-text-light)] tracking-wider mb-2">
          {wedding.date.dayOfWeek} {wedding.date.time}
        </p>
        {dday && (
          <span suppressHydrationWarning className="inline-block text-xs tracking-widest bg-[var(--color-primary)] text-white px-4 py-1 rounded-full mt-2">
            {dday}
          </span>
        )}
      </motion.div>

      <motion.div
        className="mt-10 max-w-xs mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        <p className="text-center text-sm tracking-widest text-[var(--color-text-light)] mb-4 font-serif">
          {year}년 {month}월
        </p>
        <div className="grid grid-cols-7 gap-y-2">
          {DAY_LABELS.map((l, i) => (
            <div
              key={l}
              className={`text-center text-[11px] font-medium tracking-wide pb-2 ${
                i === 0 ? "text-rose-400" : i === 6 ? "text-blue-400" : "text-[var(--color-warm-gray)]"
              }`}
            >
              {l}
            </div>
          ))}
          {cells.map((d, i) => {
            const isWedding = d === day;
            const col = i % 7;
            return (
              <div key={i} className="relative flex items-center justify-center h-9">
                {d !== null && (
                  <>
                    {isWedding && (
                      <span className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-[var(--color-primary)] opacity-15" />
                    )}
                    <span
                      className={`relative text-[13px] font-serif ${
                        isWedding
                          ? "text-[var(--color-primary-dark)] font-semibold"
                          : col === 0
                          ? "text-rose-400"
                          : col === 6
                          ? "text-blue-400"
                          : "text-[var(--color-text)]"
                      }`}
                    >
                      {d}
                      {isWedding && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px]">♥</span>
                      )}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}