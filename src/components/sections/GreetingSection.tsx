"use client";

import { motion } from "framer-motion";
import { useWedding } from "@/context/WeddingContext";

export default function GreetingSection() {
  const wedding = useWedding();
  const lines = wedding.greeting.filter((l) => l !== "");

  if (lines.length === 0) return null;

  return (
    <section className="py-24 px-8 text-center bg-[var(--color-cream)]">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-xs tracking-[0.3em] text-[var(--color-primary-dark)] font-semibold mb-12">INVITATION</p>
      </motion.div>

      <div className="space-y-3">
        {lines.map((line, i) => (
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
        ))}
      </div>

      <motion.div
        className="mt-12 max-w-[280px] mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="flex items-baseline justify-between text-sm text-[var(--color-text-light)] font-light tracking-wider">
          <span>{wedding.groom.fatherName} · {wedding.groom.motherName}의 아들</span>
          <span className="text-[var(--color-primary)] font-medium">{wedding.groom.name}</span>
        </div>
        <div className="flex items-baseline justify-between text-sm text-[var(--color-text-light)] font-light tracking-wider mt-2">
          <span>{wedding.bride.fatherName} · {wedding.bride.motherName}의 딸</span>
          <span className="text-[var(--color-primary)] font-medium">{wedding.bride.name}</span>
        </div>
      </motion.div>
    </section>
  );
}