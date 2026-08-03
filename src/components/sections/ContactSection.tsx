"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWedding } from "@/context/WeddingContext";

type Side = "groom" | "bride";
type CopiedKey = string | null;

export default function ContactSection() {
  const wedding = useWedding();
  const [tab, setTab] = useState<Side>("groom");
  const [copied, setCopied] = useState<CopiedKey>(null);

  const copyText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const current = tab === "groom" ? wedding.groom : wedding.bride;

  return (
    <section className="py-20 bg-white">
      <motion.div
        className="text-center px-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-xs tracking-[0.3em] text-[var(--color-warm-gray)] mb-2">CONTACT</p>
        <div className="section-divider mb-8" />

        <div className="flex rounded-full border border-[var(--color-primary-light)] overflow-hidden mx-8">
          {(["groom", "bride"] as Side[]).map((side) => (
            <button
              key={side}
              onClick={() => setTab(side)}
              className={`flex-1 py-2.5 text-sm tracking-widest transition-colors ${
                tab === side
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-primary)]"
              }`}
            >
              {side === "groom" ? "신랑측" : "신부측"}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        key={tab}
        className="mt-8 px-6 space-y-4"
        initial={{ opacity: 0, x: tab === "groom" ? -12 : 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="rounded-2xl border border-[var(--color-accent)] p-5 space-y-3">
          <p className="text-xs tracking-[0.25em] text-[var(--color-warm-gray)]">연락처</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-serif text-[var(--color-text)] text-lg">{current.name}</p>
              <p className="text-sm text-[var(--color-text-light)] mt-0.5">{current.phone}</p>
            </div>
            <a
              href={`tel:${current.phone}`}
              className="px-4 py-2 rounded-full bg-[var(--color-primary)] text-white text-xs tracking-wide"
            >
              전화하기
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-accent)] p-5 space-y-3">
          <p className="text-xs tracking-[0.25em] text-[var(--color-warm-gray)]">계좌번호</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text-light)]">{current.account.bank}</p>
              <p className="font-serif text-[var(--color-text)] tracking-widest mt-0.5">
                {current.account.number}
              </p>
              <p className="text-xs text-[var(--color-text-light)] mt-0.5">{current.account.holder}</p>
            </div>
            <button
              onClick={() => copyText(current.account.number, `${tab}-account`)}
              className="px-4 py-2 rounded-full border border-[var(--color-primary-light)] text-[var(--color-primary)] text-xs tracking-wide"
            >
              {copied === `${tab}-account` ? "복사됨 ✓" : "복사"}
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}