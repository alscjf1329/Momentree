"use client";

import { motion } from "framer-motion";
import { useWedding } from "@/context/WeddingContext";

// 청첩장 관례상 부모님 성함 옆엔 자녀 이름을 성 없이 이름만 적음 (예: 김태연 → 태연)
const givenName = (fullName: string) => fullName.slice(1) || fullName;

export default function GreetingSection() {
  const wedding = useWedding();
  const lines = wedding.greeting;

  if (!lines.some((l) => l !== "")) return null;

  return (
    <section className="py-24 px-8 text-center bg-[var(--color-cream)]">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-sm tracking-[0.3em] text-[var(--color-primary-dark)] font-semibold mb-12">INVITATION</p>
      </motion.div>

      <div className="space-y-3">
        {lines.map((line, i) =>
          line === "" ? (
            <div key={i} className="h-3" />
          ) : (
            <motion.p
              key={i}
              className="font-serif text-[var(--color-text)] text-[15px] leading-loose tracking-wide"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              {line}
            </motion.p>
          )
        )}
      </div>

      <motion.div
        className="mt-12 max-w-[220px] mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="grid grid-cols-[1fr_2.5rem] items-baseline text-base text-[var(--color-text-light)] font-light tracking-wider">
          <span>{wedding.groom.fatherName} · {wedding.groom.motherName}의 {wedding.groom.relation}</span>
          <span className="text-center text-[var(--color-primary)] font-medium">{givenName(wedding.groom.name)}</span>
        </div>
        <div className="grid grid-cols-[1fr_2.5rem] items-baseline text-base text-[var(--color-text-light)] font-light tracking-wider mt-2">
          <span>{wedding.bride.fatherName} · {wedding.bride.motherName}의 {wedding.bride.relation}</span>
          <span className="text-center text-[var(--color-primary)] font-medium">{givenName(wedding.bride.name)}</span>
        </div>
      </motion.div>
    </section>
  );
}