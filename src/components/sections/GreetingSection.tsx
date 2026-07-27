"use client";

import { motion } from "framer-motion";
import { WEDDING } from "@/content";

export default function GreetingSection() {
  const lines = WEDDING.greeting.filter((l) => l !== "");

  return (
    <section className="py-24 px-8 text-center bg-[var(--color-cream)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-xs tracking-[0.3em] text-[var(--color-warm-gray)] mb-6">INVITATION</p>
        <div className="section-divider mb-10" />
      </motion.div>

      <div className="space-y-3">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            className="font-serif text-[var(--color-text)] text-[15px] leading-loose tracking-wide"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            {line}
          </motion.p>
        ))}
      </div>

      <motion.div
        className="mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="section-divider mb-8" />
        <p className="text-sm text-[var(--color-text-light)] font-light tracking-wider">
          {WEDDING.groom.fatherName} · {WEDDING.groom.motherName}의 아들{" "}
          <span className="text-[var(--color-primary)] font-medium">{WEDDING.groom.name}</span>
        </p>
        <p className="text-sm text-[var(--color-text-light)] font-light tracking-wider mt-2">
          {WEDDING.bride.fatherName} · {WEDDING.bride.motherName}의 딸{" "}
          <span className="text-[var(--color-primary)] font-medium">{WEDDING.bride.name}</span>
        </p>
      </motion.div>
    </section>
  );
}
